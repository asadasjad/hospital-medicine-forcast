import unittest
from src.inventory import calculate_item_recommendation, generate_recommendations


class TestInventoryOptimizer(unittest.TestCase):

    def test_scenario_1_normal_inventory(self):
        """1. Normal inventory: Moderate buffer, standard procurement."""
        item = {
            "medicine_id": "MED001",
            "medicine_name": "Amoxicillin 500mg",
            "predicted_demand": 500,
            "current_stock": 450,
            "incoming_stock": 100,
            "unit_cost": 40.0,
            "supplier_lead_time": 5,
            "safety_stock": 100,
            "days_to_expiry": 180,
            "quantity_expiring": 0,
        }
        rec = calculate_item_recommendation(item)
        # Target = 500 + 100 = 600. Effective = 450 + 100 = 550.
        self.assertEqual(rec["recommended_order"], 50)
        self.assertEqual(rec["stockout_risk"], "MEDIUM")
        self.assertEqual(rec["expiry_risk"], "LOW")
        self.assertEqual(rec["potential_financial_loss"], 0.0)

    def test_scenario_2_excess_inventory(self):
        """2. Excess inventory: Current stock far exceeds demand + safety stock."""
        item = {
            "medicine_id": "MED002",
            "medicine_name": "Paracetamol 500mg",
            "predicted_demand": 300,
            "current_stock": 1200,
            "incoming_stock": 200,
            "unit_cost": 5.0,
            "supplier_lead_time": 3,
            "safety_stock": 60,
            "days_to_expiry": 240,
            "quantity_expiring": 0,
        }
        rec = calculate_item_recommendation(item)
        # Target = 360. Effective = 1400. Raw order = -1040 -> clamps to 0.
        self.assertEqual(rec["recommended_order"], 0)
        self.assertEqual(rec["stockout_risk"], "LOW")
        self.assertGreater(rec["days_of_supply"], 30.0)

    def test_scenario_3_high_expiry_risk(self):
        """3. High expiry risk: Stock expires before monthly demand can clear it."""
        item = {
            "medicine_id": "MED003",
            "medicine_name": "Ceftriaxone 1g Inj",
            "predicted_demand": 200,   # Burn rate = 200/30 = 6.67 units/day
            "current_stock": 350,
            "incoming_stock": 0,
            "unit_cost": 150.0,
            "supplier_lead_time": 7,
            "safety_stock": 40,
            "days_to_expiry": 15,      # 15 days left: clears ~100 units
            "quantity_expiring": 250,  # 250 expiring -> 150 at risk
        }
        rec = calculate_item_recommendation(item)
        self.assertEqual(rec["expiry_risk"], "HIGH")
        self.assertAlmostEqual(rec["potential_waste_quantity"], 150.0, delta=1.0)
        self.assertGreater(rec["potential_financial_loss"], 0.0)

    def test_scenario_4_high_stockout_risk(self):
        """4. High stockout risk: Stock covers fewer days than supplier lead time."""
        item = {
            "medicine_id": "MED004",
            "medicine_name": "Adrenaline Ampoule",
            "predicted_demand": 150,   # Burn rate = 5 units/day
            "current_stock": 10,       # Only 2 days of supply
            "incoming_stock": 0,
            "unit_cost": 85.0,
            "supplier_lead_time": 6,   # Takes 6 days for vendor to deliver
            "safety_stock": 30,
        }
        rec = calculate_item_recommendation(item)
        self.assertEqual(rec["stockout_risk"], "HIGH")
        self.assertLess(rec["days_of_supply"], item["supplier_lead_time"])

    def test_scenario_5_no_recommended_order(self):
        """5. No recommended order: Current stock + incoming satisfies target buffer."""
        item = {
            "medicine_id": "MED005",
            "medicine_name": "Azithromycin 500mg",
            "predicted_demand": 200,
            "current_stock": 220,
            "incoming_stock": 50,
            "unit_cost": 65.0,
            "safety_stock": 40,
        }
        rec = calculate_item_recommendation(item)
        # Target = 240. Effective = 270. Order must be 0.
        self.assertEqual(rec["recommended_order"], 0)

    def test_scenario_6_large_recommended_order(self):
        """6. Large recommended order: Heavy demand shock with negligible stock."""
        item = {
            "medicine_id": "MED006",
            "medicine_name": "Normal Saline 500ml",
            "predicted_demand": 1000,
            "current_stock": 50,
            "incoming_stock": 50,
            "unit_cost": 30.0,
            "safety_stock": 200,
        }
        rec = calculate_item_recommendation(item)
        # Target = 1200. Effective = 100. Order = 1100.
        self.assertEqual(rec["recommended_order"], 1100)
        self.assertEqual(rec["estimated_procurement_cost"], 33000.0)

    def test_scenario_7_zero_inventory(self):
        """7. Zero inventory: Complete stock depletion."""
        item = {
            "medicine_id": "MED007",
            "medicine_name": "Insulin Glargine",
            "predicted_demand": 120,
            "current_stock": 0,
            "incoming_stock": 0,
            "safety_stock": 30,
        }
        rec = calculate_item_recommendation(item)
        # Target = 150. Effective = 0. Order = 150.
        self.assertEqual(rec["recommended_order"], 150)
        self.assertEqual(rec["stockout_risk"], "HIGH")
        self.assertEqual(rec["days_of_supply"], 0.0)

    def test_batch_ml_output_ingestion(self):
        """Tests batch list input directly matching Asad's ML handoff contract."""
        ml_batch = [
            {"medicine_id": "A1", "predicted_demand": 300},
            {"medicine_id": "A2", "predicted_demand": 150},
        ]
        results = generate_recommendations(ml_batch)
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["recommended_order"], 300)
        self.assertEqual(results[1]["recommended_order"], 150)


if __name__ == "__main__":
    unittest.main()