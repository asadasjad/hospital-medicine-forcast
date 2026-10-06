from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


# Project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    PROJECT_ROOT
    / "data"
    / "raw"
    / "salesmonthly.csv"
)

OUTPUT_DIR = PROJECT_ROOT / "output"
OUTPUT_DIR.mkdir(exist_ok=True)


# Load data
df = pd.read_csv(
    DATA_PATH,
    parse_dates=["datum"]
)

category_columns = [
    column for column in df.columns
    if column != "datum"
]


# ============================================================
# 1. Demand over time
# ============================================================

plt.figure(figsize=(12, 6))

for category in category_columns:
    plt.plot(
        df["datum"],
        df[category],
        label=category
    )

plt.title("Monthly Pharmaceutical Demand Over Time")
plt.xlabel("Date")
plt.ylabel("Demand")
plt.legend()
plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "demand_over_time.png",
    dpi=150
)

plt.close()


# ============================================================
# 2. Average demand by category
# ============================================================

average_demand = df[
    category_columns
].mean().sort_values(ascending=False)

plt.figure(figsize=(10, 6))

average_demand.plot(
    kind="bar"
)

plt.title("Average Monthly Demand by Pharmaceutical Category")
plt.xlabel("Category")
plt.ylabel("Average Demand")

plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "average_demand_by_category.png",
    dpi=150
)

plt.close()


# ============================================================
# 3. Demand distribution
# ============================================================

plt.figure(figsize=(10, 6))

df[category_columns].boxplot()

plt.title("Demand Distribution by Pharmaceutical Category")
plt.xlabel("Category")
plt.ylabel("Demand")

plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "demand_distribution.png",
    dpi=150
)

plt.close()


print("EDA completed successfully!")

print("\nAverage demand by category:")
print(average_demand.round(2))

print("\nEDA plots saved to:")
print(OUTPUT_DIR)