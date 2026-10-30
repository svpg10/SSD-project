class ScienceError(ValueError):
    def __init__(self, code, message, path=""):
        super().__init__(message)
        self.code, self.message, self.path = code, message, path


def require(condition, code, message, path=""):
    if not condition:
        raise ScienceError(code, message, path)
