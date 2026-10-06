import json
from pathlib import Path

import pandas as pd

from src.inventory import generate_recommendations


# Project paths
PROJECT_ROOT = Path(__file__).resolve().parents[2]
PREDICTIONS_FILE = PROJECT_ROOT / "output" / "predictions.csv"
OUTPUT_FILE = PROJECT_ROOT / "output" / "inventory_recommendations.json"


# Demo inventory data.
# These values are NOT from the pharmacy sales dataset.
# They represent sample hospital inventory information
# used to demonstrate the inventory decision layer.
DEMO_INVENTORY = {
    "M01AB": {
        "current_stock": 100,
        "incoming_stock": 20,
        "safety_stock": 30,
        "supplier_lead_time": 7,
        "unit_cost": 10.0,
        "days_to_expiry": 90,
        "quantity_expiring": 0,
    },
    "M01AE": {
        "current_stock": 80,
        "incoming_stock": 20,
        "safety_stock": 25,
        "supplier_lead_time": 7,
        "unit_cost": 12.0,
        "days_to_expiry": 120,
        "quantity_expiring": 0,
    },
    "N02BA": {
        "current_stock": 150,
        "incoming_stock": 30,
        "safety_stock": 40,
        "supplier_lead_time": 5,
        "unit_cost": 8.0,
        "days_to_expiry": 150,
        "quantity_expiring": 0,
    },
    "N02BE": {
        "current_stock": 700,
        "incoming_stock": 100,
        "safety_stock": 150,
        "supplier_lead_time": 5,
        "unit_cost": 5.0,
        "days_to_expiry": 180,
        "quantity_expiring": 0,
    },
    "N05B": {
        "current_stock": 250,
        "incoming_stock": 30,
        "safety_stock": 50,
        "supplier_lead_time": 10,
        "unit_cost": 15.0,
        "days_to_expiry": 120,
        "quantity_expiring": 0,
    },
    "N05C": {
        "current_stock": 30,
        "incoming_stock": 5,
        "safety_stock": 10,
        "supplier_lead_time": 10,
        "unit_cost": 18.0,
        "days_to_expiry": 60,
        "quantity_expiring": 0,
    },
    "R03": {
        "current_stock": 120,
        "incoming_stock": 20,
        "safety_stock": 35,
        "supplier_lead_time": 7,
        "unit_cost": 20.0,
        "days_to_expiry": 100,
        "quantity_expiring": 0,
    },
    "R06": {
        "current_stock": 70,
        "incoming_stock": 15,
        "safety_stock": 25,
        "supplier_lead_time": 7,
        "unit_cost": 9.0,
        "days_to_expiry": 90,
        "quantity_expiring": 0,
    },
}


def main():
    # 1. Load the ML predictions
    predictions = pd.read_csv(PREDICTIONS_FILE)

    # 2. Rename our ML category field to the field expected
    #    by Aon's inventory engine.
    predictions = predictions.rename(columns={"category_code": "atc_code"})

    # 3. Convert predictions into records.
    prediction_records = predictions.to_dict(orient="records")

    # 4. Add inventory information to each prediction.
    for record in prediction_records:
        atc_code = record["atc_code"]

        inventory = DEMO_INVENTORY.get(atc_code, {})

        record.update(inventory)

    # 5. Run Aon's inventory recommendation engine.
    recommendations = generate_recommendations(
        prediction_records,
        planning_horizon_days=30,
    )
    # 5b. Convert the inventory engine's generic medicine fields
#     into category-based fields because our dataset contains
#     ATC pharmaceutical categories, not individual medicines.
    for recommendation in recommendations:
        recommendation["category_code"] = recommendation.pop("medicine_id")
        recommendation.pop("medicine_name", None)

    # 6. Save the final combined output.
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(recommendations, file, indent=2)

    # 7. Display a simple console summary.
    print("=" * 60)
    print("HOSPITAL MEDICINE FORECASTING PIPELINE")
    print("=" * 60)

    print(f"\nLoaded predictions: {len(prediction_records)}")
    print(f"Output saved to: {OUTPUT_FILE}\n")

    for recommendation in recommendations:
        print(
            f"{recommendation['category_code']}: "
            f"demand={recommendation['predicted_demand']:.2f} | "
            f"order={recommendation['recommended_order']} | "
            f"stockout={recommendation['stockout_risk']} | "
            f"expiry={recommendation['expiry_risk']}"
        )


if __name__ == "__main__":
    main()