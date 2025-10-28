from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
CORS(app)

# ---- Utility ----
def try_parse_date(date_str):
    """Try to detect and parse date in multiple formats dynamically."""
    if not date_str:
        return False, "Date of birth is required"

    date_formats = [
        "%Y-%m-%d",  # ISO
        "%d-%m-%Y",  # Common in India / EU
        "%m-%d-%Y",  # US variant with dashes
        "%d/%m/%Y",  # Common with slashes
        "%m/%d/%Y",  # US variant with slashes
        "%Y/%m/%d",  # ISO with slashes
    ]

    for fmt in date_formats:
        try:
            parsed_date = datetime.strptime(date_str, fmt).date()
            return True, parsed_date
        except ValueError:
            continue

    return False, f"Invalid date format: '{date_str}'. Supported formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, etc."


# ---- Age Calculation ----
def calculate_age_details(dob):
    today = datetime.now().date()
    years = today.year - dob.year

    if (today.month, today.day) < (dob.month, dob.day):
        years -= 1

    # Handle months & days
    months = today.month - dob.month
    days = today.day - dob.day

    if days < 0:
        months -= 1
        last_month = today.month - 1 or 12
        last_year = today.year if today.month != 1 else today.year - 1
        days_in_last_month = (datetime(last_year, last_month % 12 + 1, 1) - timedelta(days=1)).day
        days += days_in_last_month

    if months < 0:
        months += 12

    total_months = years * 12 + months
    total_days = (today - dob).days

    # Next birthday logic
    try:
        next_birthday = dob.replace(year=today.year)
        if next_birthday <= today:
            next_birthday = dob.replace(year=today.year + 1)
    except ValueError:
        # For Feb 29
        next_birthday = dob.replace(year=today.year + (1 if today.month > 2 else 0), day=28)

    days_until_birthday = (next_birthday - today).days

    return {
        "years": years,
        "months": months,
        "days": days,
        "total_months": total_months,
        "total_days": total_days,
        "dob": dob.strftime("%B %d, %Y"),
        "next_birthday": f"{next_birthday.strftime('%B %d, %Y')} ({days_until_birthday} days)",
    }


# ---- Routes ----
@app.route("/api/calculate-age", methods=["POST"])
def calculate_age():
    data = request.get_json(silent=True) or {}
    dob_str = str(data.get("dob", "")).strip()

    valid, result = try_parse_date(dob_str)
    if not valid:
        return jsonify({"error": result}), 400

    dob = result
    today = datetime.now().date()

    if dob > today:
        return jsonify({"error": "Date of birth cannot be in the future"}), 400

    if dob.year < 1900:
        return jsonify({"error": "Date of birth must be after 1900"}), 400

    age_info = calculate_age_details(dob)
    return jsonify(age_info), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "age-calculator-api",
        "version": "1.1.0"
    }), 200


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
