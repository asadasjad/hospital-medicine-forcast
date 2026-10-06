import math
from typing import Any, Dict, List, Optional, Union


def _extract_field(item: Dict[str, Any], candidate_keys: List[str], default: Any = None) -> Any:
    for key in candidate_keys:
        if key in item and item[key] is not None:
            return item[key]
    return default


def calculate_item_recommendation(
    prediction: Dict[str, Any],
    inventory_state: Optional[Dict[str, Any]] = None,
    planning_horizon_days: int = 30,
) -> Dict[str, Any]:
    source_data = {**(inventory_state or {}), **prediction}

    # 1. Resolve identification
    item_id = str(
        _extract_field(source_data, ["medicine_id", "item_id", "id", "code", "atc_code"], "UNKNOWN")
    )
    item_name = str(
        _extract_field(source_data, ["medicine_name", "item_name", "name", "drug_name", "description"], item_id)
    )

    # 2. Extract numeric values with fallbacks
    raw_demand = _extract_field(source_data, ["predicted_demand", "forecast", "prediction", "y_pred", "demand"], 0.0)
    try:
        predicted_demand = max(0.0, float(raw_demand))
    except (ValueError, TypeError):
        predicted_demand = 0.0

    current_stock = max(0.0, float(_extract_field(source_data, ["current_stock", "stock_on_hand", "stock"], 0.0)))
    incoming_stock = max(0.0, float(_extract_field(source_data, ["incoming_stock", "on_order", "in_transit"], 0.0)))
    safety_stock = max(0.0, float(_extract_field(source_data, ["safety_stock", "buffer_stock"], 0.0)))
    supplier_lead_time = max(1, int(_extract_field(source_data, ["supplier_lead_time", "lead_time_days", "lead_time"], 7)))
    unit_cost = max(0.0, float(_extract_field(source_data, ["unit_cost", "cost_per_unit", "price"], 0.0)))

    days_to_expiry = _extract_field(source_data, ["days_to_expiry", "expiry_days", "shelf_life_days"], None)
    quantity_expiring = max(0.0, float(_extract_field(source_data, ["quantity_expiring", "expiring_stock"], 0.0)))

    # 3. Core Calculations
    daily_burn_rate = predicted_demand / planning_horizon_days if planning_horizon_days > 0 else 0.0

    potential_waste_quantity = 0.0
    expiry_risk = "LOW"

    if days_to_expiry is not None:
        try:
            days_left = float(days_to_expiry)
            if days_left <= planning_horizon_days and quantity_expiring > 0:
                expected_consumption = daily_burn_rate * max(0.0, days_left)
                potential_waste_quantity = max(0.0, quantity_expiring - expected_consumption)
                potential_waste_quantity = min(potential_waste_quantity, quantity_expiring)
                if potential_waste_quantity > 0:
                    expiry_risk = "HIGH"
            elif days_left <= (planning_horizon_days * 2) and current_stock > (predicted_demand * 1.5):
                expiry_risk = "MEDIUM"
        except (ValueError, TypeError):
            expiry_risk = "N/A"
    else:
        expiry_risk = "N/A"

    usable_current_stock = max(0.0, current_stock - potential_waste_quantity)
    net_effective_inventory = usable_current_stock + incoming_stock

    target_inventory = predicted_demand + safety_stock
    raw_order_quantity = target_inventory - net_effective_inventory
    recommended_order = max(0, math.ceil(raw_order_quantity))

    if daily_burn_rate > 0:
        days_of_supply = round(net_effective_inventory / daily_burn_rate, 1)
    else:
        days_of_supply = 999.0 if net_effective_inventory > 0 else 0.0

    coverage_ratio = (net_effective_inventory / target_inventory) if target_inventory > 0 else 1.0

    if days_of_supply <= supplier_lead_time or coverage_ratio < 0.50:
        stockout_risk = "HIGH"
    elif days_of_supply <= planning_horizon_days or coverage_ratio < 1.00:
        stockout_risk = "MEDIUM"
    else:
        stockout_risk = "LOW"

    potential_financial_loss = round(potential_waste_quantity * unit_cost, 2)
    estimated_procurement_cost = round(recommended_order * unit_cost, 2)

    return {
        "medicine_id": item_id,
        "medicine_name": item_name,
        "predicted_demand": round(predicted_demand, 2),
        "current_stock": round(current_stock, 2),
        "incoming_stock": round(incoming_stock, 2),
        "safety_stock": round(safety_stock, 2),
        "recommended_order": recommended_order,
        "days_of_supply": days_of_supply,
        "stockout_risk": stockout_risk,
        "expiry_risk": expiry_risk,
        "potential_waste_quantity": round(potential_waste_quantity, 2),
        "potential_financial_loss": potential_financial_loss,
        "estimated_procurement_cost": estimated_procurement_cost,
    }


def generate_recommendations(
    predictions: Union[List[Dict[str, Any]], Any],
    inventory_data: Optional[Union[Dict[str, Dict[str, Any]], List[Dict[str, Any]]]] = None,
    planning_horizon_days: int = 30,
) -> List[Dict[str, Any]]:
    if hasattr(predictions, "to_dict"):
        prediction_list = predictions.to_dict(orient="records")
    elif isinstance(predictions, list):
        prediction_list = predictions
    else:
        raise TypeError("Predictions must be a list of dictionaries or a pandas DataFrame.")

    inventory_map: Dict[str, Dict[str, Any]] = {}
    if isinstance(inventory_data, list):
        for entry in inventory_data:
            idx = _extract_field(entry, ["medicine_id", "item_id", "id", "code", "atc_code"])
            if idx:
                inventory_map[str(idx)] = entry
    elif isinstance(inventory_data, dict):
        inventory_map = inventory_data

    results = []
    for pred in prediction_list:
        lookup_key = str(_extract_field(pred, ["medicine_id", "item_id", "id", "code", "atc_code"], ""))
        matched_inventory = inventory_map.get(lookup_key, {})
        recommendation = calculate_item_recommendation(
            prediction=pred,
            inventory_state=matched_inventory,
            planning_horizon_days=planning_horizon_days,
        )
        results.append(recommendation)

    return results