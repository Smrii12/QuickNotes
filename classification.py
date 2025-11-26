import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# 1. Load dataset
df = pd.read_csv("health_risk_small.csv")
print(df)

# 2. Features and target
X = df[["age", "bmi", "glucose"]]
y = df["risk"]

# 3. Split into training/testing
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# 4. Train model
model = LogisticRegression()
model.fit(X_train, y_train)

# 5. Predict
y_pred = model.predict(X_test)

# 6. Accuracy
print("\nAccuracy:", accuracy_score(y_test, y_pred))

# 7. Visualization (age vs glucose)
plt.scatter(df["age"], df["glucose"], c=df["risk"])
plt.xlabel("Age")
plt.ylabel("Glucose Level")
plt.title("Health Risk Dataset Visualization")
plt.grid(True)
plt.show()
