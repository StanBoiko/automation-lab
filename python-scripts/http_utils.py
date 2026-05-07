import time
import requests

def get_json(url: str, *, timeout_s: float = 10, retries: int = 3) -> dict:
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            r = requests.get(url, timeout=timeout_s)
            r.raise_for_status()          # turns 4xx/5xx into an exception
            return r.json()               # parse JSON

        except requests.exceptions.Timeout:
            last_error = f"Timeout after {timeout_s}s (attempt {attempt}/{retries})"

        except requests.exceptions.HTTPError as e:
            status = e.response.status_code if e.response is not None else "unknown"
            raise RuntimeError(f"HTTP error: {status}") from e

        except requests.exceptions.RequestException as e:
            last_error = f"Network/request error: {type(e).__name__}: {e}"

        except ValueError as e:
            raise RuntimeError("Response was not valid JSON.") from e

        if attempt < retries:
            time.sleep(attempt)  # 1s, 2s, 3s backoff

    raise RuntimeError(f"All retries failed. Last error: {last_error}")
