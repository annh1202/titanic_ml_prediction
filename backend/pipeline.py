import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OrdinalEncoder, OneHotEncoder
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

# Load Titanic dataset
titanic_dataset = pd.read_csv("dataset/raw/titanic.csv")
df = pd.DataFrame(titanic_dataset)

# Split column type
numeric_columns = ['Age', 'Fare', 'SibSp', 'Parch']
ordinal_columns = ['Pclass']
categorical_columns = ['Sex', 'Embarked']

# Transformer columns
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])
ordinal_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('ordinal', OrdinalEncoder(categories=[[1, 2, 3]]))
])
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(drop='first', handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('numeric', numeric_transformer, numeric_columns),
        ('ordinal', ordinal_transformer, ordinal_columns),
        ('categorical', categorical_transformer, categorical_columns)
    ],
    remainder='drop'
)

# Train multiple models
logistic_regression_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('logistic_regression', LogisticRegression())
])

random_forest_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('random_forest', RandomForestClassifier())
])

tree_decision_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('decision_tree', DecisionTreeClassifier())
])

svm_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('svm', SVC())
])

X = df.drop(columns=['Survived'])
y = df['Survived']

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

logistic_regression_pipeline.fit(X_train, y_train)
random_forest_pipeline.fit(X_train, y_train)
tree_decision_pipeline.fit(X_train, y_train)
svm_pipeline.fit(X_train, y_train)

# Compare model
logistic_regression_score = cross_val_score(logistic_regression_pipeline, X_train, y_train, cv=5)
random_forest_score = cross_val_score(random_forest_pipeline, X_train, y_train, cv=5)
tree_decision_score = cross_val_score(tree_decision_pipeline, X_train, y_train, cv=5)
svm_score = cross_val_score(svm_pipeline, X_train, y_train, cv=5)

print("Logistic Regression score:", logistic_regression_score)
print("Random Forest score:", random_forest_score)
print("Decision Tree score:", tree_decision_score)
print("SVM score:", svm_score)

print(f"Logistic Regression mean: {round(random_forest_score.mean()*100, 3)}%")
print(f"Random Forest mean: {round(random_forest_score.mean()*100, 3)}%")
print(f"Decision Tree mean: {round(tree_decision_score.mean()*100, 3)}%")
print(f"SVM mean: {round(svm_score.mean()*100, 3)}%")

# Predict
logistic_regression_prediction = logistic_regression_pipeline.predict(X_test)
random_forest_prediction = random_forest_pipeline.predict(X_test)
tree_decision_prediction = tree_decision_pipeline.predict(X_test)
svm_prediction = svm_pipeline.predict(X_test)

logistic_regression_accuracy = accuracy_score(logistic_regression_prediction, y_test)
print(f"Logistic Regression accuracy: {round(logistic_regression_accuracy*100, 3)}%")

random_forest_accuracy = accuracy_score(random_forest_prediction, y_test)
print(f"Random Forest accuracy: {round(random_forest_accuracy*100, 3)}%")

tree_decision_accuracy = accuracy_score(tree_decision_prediction, y_test)
print(f"Decision Tree accuracy: {round(tree_decision_accuracy*100, 3)}%")

svm_accuracy = accuracy_score(svm_prediction, y_test)
print(f"SVM accuracy: {round(svm_accuracy*100, 3)}%")

