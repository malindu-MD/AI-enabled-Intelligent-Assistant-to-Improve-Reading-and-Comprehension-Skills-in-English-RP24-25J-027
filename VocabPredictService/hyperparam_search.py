import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from skopt import BayesSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
import pickle

RANDOM_SEED = 0

# Initialize the TF-IDF Vectorizer
vectorizer = TfidfVectorizer()
label_encoder = LabelEncoder()  # Initialize label_encoder here

def load_data(path_to_data):
    """Load data, preprocess (vectorize the text), and return features and labels"""
    data = pd.read_csv(path_to_data)
    X = data.text.tolist()  # Raw text data
    y = encode_labels(data.label)

    # Convert text data to numerical vectors using TF-IDF
    X_vect = vectorizer.fit_transform(X)

    return X_vect, y

def encode_labels(labels):
    """Encode the labels as integers"""
    global label_encoder
    return label_encoder.fit_transform(labels)  # Fit and transform labels

def save_model(model, name):
    """Save the model to a file"""
    name = name.lower().replace(" ", "_")
    file_name = f"models/cefr-{name}.pickle"
    print(f"Saving {file_name}")
    pickle.dump(model, open(file_name, "wb"))

def compare_models():
    """Compares several classifiers by performing Bayesian optimization on each one and ranking the results."""
    train = pd.read_csv("data/train.csv")
    test = pd.read_csv("data/test.csv")

    results = []

    for configs in get_model_configs():
        best_result = hyperparam_search(configs, train, test)
        save_model(best_result)
        results.append(best_result)

    rank_results(results)

def hyperparam_search(model_config, train, test):
    """Perform hyperparameter search using Bayesian optimization on a given model and dataset."""
    X_train, y_train = load_data("data/train.csv")  # Load and vectorize training data
    X_test, y_test = load_data("data/test.csv")    # Load and vectorize test data

    # Perform Bayesian Search for hyperparameter tuning
    opt = BayesSearchCV(
        model_config["model"],
        model_config["params"],
        n_jobs=4,
        cv=5,
        random_state=RANDOM_SEED,
    )
    opt.fit(X_train, y_train)
    acc = opt.score(X_test, y_test)

    print(f"{model_config['name']} results:")
    print(f"Best validation accuracy: {opt.best_score_}")
    print(f"Test set accuracy: {acc}")
    print(f"Best parameters:")

    for param, value in opt.best_params_.items():
        print(f"- {param}: {value}")

    return {
        "name": model_config["name"],
        "class": model_config["class"],
        "model": opt.best_estimator_,
        "params": opt.best_params_,
        "score": acc,
    }

def get_model_configs():
    """Define the models and their hyperparameter spaces for optimization."""
    return [
        {
            "name": "Logistic Regression",
            "model": LogisticRegression(random_state=RANDOM_SEED),
            "class": LogisticRegression,
            "params": {
                "C": (0.1, 10),
                "fit_intercept": [True, False],
                "max_iter": (100, 1000),
            },
        },
        {
            "name": "Random Forest",
            "model": RandomForestClassifier(random_state=RANDOM_SEED),
            "class": RandomForestClassifier,
            "params": {
                "bootstrap": [True, False],
                "max_depth": (10, 100),
                "max_features": ["auto", "sqrt"],
                "min_samples_leaf": (1, 5),
                "min_samples_split": (2, 10),
                "n_estimators": (100, 500),
            },
        },
        {
            "name": "SVC",
            "model": SVC(random_state=RANDOM_SEED, probability=True),
            "class": SVC,
            "params": {"C": (0.1, 10), "gamma": (0.0001, 0.1)},
        },
        {
            "name": "XGBoost",
            "model": XGBClassifier(
                objective="multi:softprob", random_state=RANDOM_SEED
            ),
            "class": XGBClassifier,
            "params": {
                "learning_rate": (0.01, 0.1),
                "max_depth": (1, 10),
                "subsample": (0.8, 1.0),
                "colsample_bytree": (0.8, 1.0),
                "gamma": (1, 5),
                "n_estimators": (50, 500),
            },
        },
    ]

def rank_results(results):
    """Ranks the results of the hyperparameter search, prints the ranks and returns them."""
    ranking = sorted(results, key=lambda k: k["score"], reverse=True)
    for i, rank in enumerate(ranking):
        print(f"{i+1}. {rank['name']}: {rank['score']}")
    print("\n")
    return ranking

if __name__ == "__main__":
    compare_models()
