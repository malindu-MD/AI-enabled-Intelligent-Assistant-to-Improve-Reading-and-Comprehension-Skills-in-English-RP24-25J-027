import pandas as pd
from joblib import dump
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler, FunctionTransformer
from skopt import BayesSearchCV
from skopt.space import Real, Integer, Categorical
from cefr_predictor.preprocessing import generate_features

RANDOM_SEED = 0

label_encoder = None    

param_spaces = {
    "XGBoost": {
                "learning_rate": (0.01, 0.1),
                "max_depth": (1, 10),
                "subsample": (0.8, 1.0),
                "colsample_bytree": (0.8, 1.0),
                "gamma": (1, 5),
                "n_estimators": (50, 500),
    },
    "Logistic Regression": {
        "model__C": Real(0.01, 10, prior='log-uniform'),
        "model__penalty": Categorical(["l2"]),
        "model__solver": Categorical(["liblinear", "saga"]),
    },
    "Random Forest": {
        "model__n_estimators": Integer(50, 200),
        "model__max_depth": Categorical([None, 10, 20, 30]),
        "model__min_samples_split": Integer(2, 10),
        "model__min_samples_leaf": Integer(1, 4),
    },
    "SVC": {
        "model__C": Real(0.1, 10, prior='log-uniform'),
        "model__kernel": Categorical(["linear", "rbf"]),
        "model__gamma": Categorical(["scale", "auto"]),
    },
}

def train(model, param_space=None):
    print(f"Training {model['name']}.")
    pipeline = build_pipeline(model["model"])

    # Hyperparameter tuning with BayesSearchCV
    if param_space:
        opt = BayesSearchCV(
            pipeline,
            param_space,
            n_iter=50,  # Number of iterations for Bayesian optimization
            cv=3,  # 3-fold cross-validation
            n_jobs=-1,  # Parallelization (use all CPUs)
            verbose=1,
        )
        opt.fit(X_train, y_train)
        print(f"Best parameters for {model['name']}: {opt.best_params_}")
        print(f"Best cross-validation score: {opt.best_score_}")
        best_model = opt.best_estimator_
    else:
        pipeline.fit(X_train, y_train)
        best_model = pipeline
        print(f"Model score: {pipeline.score(X_test, y_test)}")

    # Evaluate the best model on the test set
    print(f"Test score: {best_model.score(X_test, y_test)}")
    save_model(best_model, model["name"])

def build_pipeline(model):
    """Creates a pipeline with feature extraction, feature scaling, and a predictor."""
    return Pipeline(
        steps=[
            ("generate features", FunctionTransformer(generate_features)),
            ("scale features", StandardScaler()),
            ("model", model),
        ],
        verbose=True,
    )

def load_data(path_to_data):
    data = pd.read_csv(path_to_data)
    X = data.text.tolist()
    y = encode_labels(data.label)
    return X, y

def encode_labels(labels):
    global label_encoder
    if not label_encoder:
        label_encoder = LabelEncoder()
        label_encoder.fit(labels)
    return label_encoder.transform(labels)

def save_model(model, name):
    name = name.lower().replace(" ", "_")
    file_name = f"cefr_predictor/mod/{name}.joblib"
    print(f"Saving {file_name}")
    dump(model, file_name)

models = [
    {
        "name": "XGBoost",
        "model": XGBClassifier(
            objective="multi:softprob",
            random_state=RANDOM_SEED,
        ),
    },
    {
        "name": "Logistic Regression",
        "model": LogisticRegression(random_state=RANDOM_SEED),
    },
    {
        "name": "Random Forest",
        "model": RandomForestClassifier(random_state=RANDOM_SEED),
    },
    {"name": "SVC", "model": SVC(random_state=RANDOM_SEED, probability=True)},
]

X_train, y_train = load_data("data/train.csv")
X_test, y_test = load_data("data/test.csv")

if __name__ == "__main__":
    for model in models:
        param_space = param_spaces.get(model["name"], None)  # Get the search space for the model
        train(model, param_space)
