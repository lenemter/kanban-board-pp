import bcrypt


HASH_ALGORITHM = "HS256"
PREFIX = "/api/v1"


def read_secret(secret_name: str) -> str | None:
    try:
        with open(f"secrets/{secret_name}") as file:
            return file.read()
    except OSError:
        print("File not found")
        return None


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
