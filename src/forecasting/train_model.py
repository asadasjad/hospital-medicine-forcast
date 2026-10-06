from pathlib import Path

import numpy as np
import pandas as pd

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error


# ============================================================
# 1. LOAD DATASET
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = PROJECT_ROOT / "data" / "raw" / "salesmonthly.csv"

df = pd.read_csv(DATA_PATH, parse_dates=["datum"])


print("Dataset loaded successfully!")
print(f"Shape: {df.shape}")
print(
    f"Date range: "
    f"{df['datum'].min().date()} to {df['datum'].max().date()}"
)
print(f"Missing values: {df.isna().sum().sum()}")

print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 5 rows:")
print(df.head())


# ============================================================
# 2. RESHAPE FROM WIDE FORMAT TO LONG FORMAT
# ============================================================

category_columns = [
    column for column in df.columns
    if column != "datum"
]

long_df = df.melt(
    id_vars="datum",
    value_vars=category_columns,
    var_name="category",
    value_name="demand",
)

long_df = long_df.sort_values(
    ["category", "datum"]
).reset_index(drop=True)

print("\nLong-format data:")
print(long_df.head(10))

print(f"\nLong-format shape: {long_df.shape}")


# ============================================================
# 3. CREATE TIME-SERIES FEATURES
# ============================================================

long_df["month"] = long_df["datum"].dt.month
long_df["year"] = long_df["datum"].dt.year

# Sequential time index
long_df["time_index"] = (
    (long_df["datum"].dt.year - long_df["datum"].dt.year.min()) * 12
    + long_df["datum"].dt.month
)

# Previous-month demand
long_df["lag_1"] = (
    long_df.groupby("category")["demand"].shift(1)
)

# Demand from two months ago
long_df["lag_2"] = (
    long_df.groupby("category")["demand"].shift(2)
)

# Demand from three months ago
long_df["lag_3"] = (
    long_df.groupby("category")["demand"].shift(3)
)

# Average demand from previous 3 months
long_df["rolling_3"] = (
    long_df.groupby("category")["demand"]
    .transform(
        lambda x: x.shift(1).rolling(3).mean()
    )
)

# Average demand from previous 6 months
long_df["rolling_6"] = (
    long_df.groupby("category")["demand"]
    .transform(
        lambda x: x.shift(1).rolling(6).mean()
    )
)

print("\nFeatures created:")
print(
    long_df.head(10).to_string(index=False)
)


# ============================================================
# 4. PREPARE MODEL DATA
# ============================================================

feature_columns = [
    "month",
    "time_index",
    "lag_1",
    "lag_2",
    "lag_3",
    "rolling_3",
    "rolling_6",
]

model_df = long_df.dropna(
    subset=feature_columns
).copy()

print("\nModel dataset:")
print(f"Shape: {model_df.shape}")

print(
    "Remaining missing values: "
    f"{model_df[feature_columns].isna().sum().sum()}"
)


# ============================================================
# 5. TIME-BASED TRAIN / TEST SPLIT
# ============================================================

TEST_MONTHS = 12

unique_dates = sorted(
    model_df["datum"].unique()
)

split_date = unique_dates[-TEST_MONTHS]

train_df = model_df[
    model_df["datum"] < split_date
].copy()

test_df = model_df[
    model_df["datum"] >= split_date
].copy()

print("\nTime-based split:")

print(
    f"Training period: "
    f"{train_df['datum'].min().date()} "
    f"to "
    f"{train_df['datum'].max().date()}"
)

print(
    f"Testing period:  "
    f"{test_df['datum'].min().date()} "
    f"to "
    f"{test_df['datum'].max().date()}"
)

print(f"Training rows: {len(train_df)}")
print(f"Testing rows: {len(test_df)}")


# ============================================================
# 6. EVALUATION FUNCTION
# ============================================================

def evaluate_predictions(actual, predicted):

    actual = np.asarray(actual)
    predicted = np.asarray(predicted)

    mae = mean_absolute_error(
        actual,
        predicted
    )

    rmse = np.sqrt(
        mean_squared_error(
            actual,
            predicted
        )
    )

    non_zero = actual != 0

    if non_zero.any():

        mape = np.mean(
            np.abs(
                (
                    actual[non_zero]
                    - predicted[non_zero]
                )
                / actual[non_zero]
            )
        ) * 100

    else:

        mape = np.nan

    return {
        "MAE": mae,
        "RMSE": rmse,
        "MAPE": mape,
    }


# ============================================================
# 7. NAIVE BASELINE
# ============================================================

baseline_predictions = test_df["lag_1"]

baseline_metrics = evaluate_predictions(
    test_df["demand"],
    baseline_predictions,
)

print("\nNaive baseline:")

for metric, value in baseline_metrics.items():

    print(
        f"{metric}: {value:.2f}"
    )


# ============================================================
# 8. PREPARE FEATURES FOR LINEAR REGRESSION
# ============================================================

X_train = train_df[
    feature_columns + ["category"]
].copy()

X_test = test_df[
    feature_columns + ["category"]
].copy()

y_train = train_df["demand"]
y_test = test_df["demand"]


# Convert pharmaceutical categories into
# numerical one-hot encoded columns

X_train = pd.get_dummies(
    X_train,
    columns=["category"],
    dtype=int,
)

X_test = pd.get_dummies(
    X_test,
    columns=["category"],
    dtype=int,
)

# Make sure train and test have identical columns

X_test = X_test.reindex(
    columns=X_train.columns,
    fill_value=0,
)


# ============================================================
# 9. TRAIN LINEAR REGRESSION
# ============================================================

linear_model = LinearRegression()

linear_model.fit(
    X_train,
    y_train,
)

linear_predictions = linear_model.predict(
    X_test
)

linear_metrics = evaluate_predictions(
    y_test,
    linear_predictions,
)

print("\nLinear Regression:")

for metric, value in linear_metrics.items():

    print(
        f"{metric}: {value:.2f}"
    )


# ============================================================
# 10. CATEGORY-LEVEL EVALUATION
# ============================================================

test_results = test_df[
    ["datum", "category", "demand"]
].copy()

test_results[
    "baseline_prediction"
] = baseline_predictions.values

test_results[
    "linear_prediction"
] = linear_predictions


print("\nPerformance by category:")

for category in test_results["category"].unique():

    category_data = test_results[
        test_results["category"] == category
    ]

    baseline_category_metrics = (
        evaluate_predictions(
            category_data["demand"],
            category_data["baseline_prediction"],
        )
    )

    linear_category_metrics = (
        evaluate_predictions(
            category_data["demand"],
            category_data["linear_prediction"],
        )
    )

    print(f"\n{category}:")

    print(
        f"  Baseline MAE: "
        f"{baseline_category_metrics['MAE']:.2f}"
    )

    print(
        f"  Linear MAE:   "
        f"{linear_category_metrics['MAE']:.2f}"
    )


# ============================================================
# 11. FINAL MODEL
# ============================================================

print("\n" + "=" * 60)
print("FINAL MODEL - NEXT MONTH FORECAST")
print("=" * 60)


# Train Linear Regression again using
# all available historical observations

final_model = LinearRegression()

X_all = model_df[
    feature_columns + ["category"]
].copy()

y_all = model_df["demand"]


# One-hot encode categories

X_all = pd.get_dummies(
    X_all,
    columns=["category"],
    dtype=int,
)


# ============================================================
# 12. PREPARE NEXT-MONTH FORECAST INPUT
# ============================================================

latest_date = long_df["datum"].max()

forecast_date = (
    latest_date
    + pd.offsets.MonthEnd(1)
)


# We use the latest historical month
# to construct the features needed
# for the next-month prediction.

forecast_df = long_df[
    long_df["datum"] == latest_date
].copy()


X_forecast = forecast_df[
    feature_columns + ["category"]
].copy()


X_forecast = pd.get_dummies(
    X_forecast,
    columns=["category"],
    dtype=int,
)


# Make forecast columns identical
# to training columns

X_forecast = X_forecast.reindex(
    columns=X_all.columns,
    fill_value=0,
)


# ============================================================
# 13. TRAIN FINAL MODEL AND PREDICT
# ============================================================

final_model.fit(
    X_all,
    y_all,
)

forecast_predictions = final_model.predict(
    X_forecast
)


# Demand cannot be negative

forecast_predictions = np.clip(
    forecast_predictions,
    0,
    None,
)


# ============================================================
# 14. CREATE FINAL PREDICTION TABLE
# ============================================================

predictions = pd.DataFrame({

    "forecast_date": forecast_date,

    "category_code":
        forecast_df["category"].values,

    "predicted_demand":
        forecast_predictions,

})


# Round for clean output

predictions[
    "predicted_demand"
] = predictions[
    "predicted_demand"
].round(2)


print("\nNext month forecast:")

print(
    predictions.to_string(
        index=False
    )
)


# ============================================================
# 15. SAVE PREDICTIONS
# ============================================================

OUTPUT_DIR = PROJECT_ROOT / "output"

OUTPUT_DIR.mkdir(
    exist_ok=True
)

OUTPUT_PATH = (
    OUTPUT_DIR / "predictions.csv"
)


predictions.to_csv(
    OUTPUT_PATH,
    index=False,
)


print("\nPredictions saved to:")

print(OUTPUT_PATH)

print("\nDone!")