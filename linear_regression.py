import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

# Load Dataset
data = pd.read_csv("salary_dataset.csv")

# Split data into input and output
X = data[['YearsExperience']]
y = data['Salary']

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Model
model = LinearRegression()
model.fit(X_train, y_train)

# Predict on test set
y_pred = model.predict(X_test)

# Print Results
print("Model Coefficient (Slope):", model.coef_[0])
print("Model Intercept:", model.intercept_)

# Compare actual vs predicted
results = pd.DataFrame({'Actual Salary': y_test, 'Predicted Salary': y_pred})
print(results)

# Plotting the regression line
plt.scatter(X, y)
plt.plot(X, model.predict(X), linewidth=3)
plt.xlabel("Years of Experience")
plt.ylabel("Salary")
plt.title("Salary Prediction Using Linear Regression")
plt.show()

# Predict salary for new input
years = float(input("Enter years of experience: "))
predicted_salary = model.predict([[years]])
print("Predicted Salary:", predicted_salary[0])