import json
from src.inventory import generate_recommendations

# 1. Simulated ML output from Asad's model
mock_ml_predictions = [
    {
        "medicine_id": "MED-001",
        "medicine_name": "Amoxicillin 500mg",
        "predicted_demand": 500,
        "current_stock": 450,
        "incoming_stock": 100,
        "safety_stock": 100,
        "unit_cost": 12.50,
        "supplier_lead_time": 5,
        "days_to_expiry": 180,
        "quantity_expiring": 0,
    },
    {
        "medicine_id": "MED-002",
        "medicine_name": "Paracetamol 500mg",
        "predicted_demand": 300,
        "current_stock": 1200,
        "incoming_stock": 0,
        "safety_stock": 50,
        "unit_cost": 2.00,
        "supplier_lead_time": 3,
        "days_to_expiry": 240,
        "quantity_expiring": 0,
    },
    {
        "medicine_id": "MED-003",
        "medicine_name": "Ceftriaxone 1g Inj",
        "predicted_demand": 200,
        "current_stock": 350,
        "incoming_stock": 0,
        "safety_stock": 40,
        "unit_cost": 85.00,
        "supplier_lead_time": 7,
        "days_to_expiry": 15,
        "quantity_expiring": 250,
    },
    {
        "medicine_id": "MED-004",
        "medicine_name": "Adrenaline 1mg/ml",
        "predicted_demand": 150,
        "current_stock": 10,
        "incoming_stock": 0,
        "safety_stock": 30,
        "unit_cost": 45.00,
        "supplier_lead_time": 6,
        "days_to_expiry": 300,
        "quantity_expiring": 0,
    },
]

# 2. Process recommendations through inventory logic
results = generate_recommendations(mock_ml_predictions)

# 3. Save formatted output for Yasir's frontend team
output_filename = "inventory_recommendations_sample.json"
with open(output_filename, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print(f"Generated recommendations for {len(results)} medicines.")
print(f"Saved output to: {output_filename}\n")

# Print console preview
for r in results:
    print(
        f"[{r['medicine_id']}] {r['medicine_name']}: "
        f"Order = {r['recommended_order']} units | "
        f"Stockout Risk = {r['stockout_risk']} | "
        f"Expiry Risk = {r['expiry_risk']} | "
        f"Loss Risk = ${r['potential_financial_loss']}"
    )