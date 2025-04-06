import csv
import json
import os
import sys

# FIPS codes gathered so far (ensure they are 5 digits for matching)
target_fips = {
    "45045",  # Greenville County, SC
    "45007",  # Anderson County, SC
    "45001",  # Abbeville County, SC
    "45077",  # Pickens County, SC
    "45073",  # Oconee County, SC
    "45013",  # Beaufort County, SC
    "45035",  # Dorchester County, SC
    "45015",  # Berkeley County, SC
    "45043",  # Georgetown County, SC
    "45051",  # Horry County, SC
    "45063",  # Lexington County, SC
    "45081",  # Saluda County, SC
    "13021",  # Bibb County, GA
    "13015",  # Bartow County, GA
    # Add remaining FIPS codes here when gathered
}

# Indicators to extract (Variable Codes)
target_indicators = {
    "FSRPTH16",       # Full-service restaurants/1,000 pop, 2016
    "PC_FSRSALES12",  # Expenditures per capita, restaurants, 2012
    "FMRKTPTH18",     # Farmers' markets/1,000 pop, 2018
}

input_csv_path = os.path.join('public', 'food', 'StateAndCountyData.csv')
output_json_path = os.path.join('data', 'county_food_data.json')

extracted_data = {}

try:
    # Use utf-8-sig to automatically handle BOM
    with open(input_csv_path, mode='r', encoding='utf-8-sig') as infile:
        reader = csv.DictReader(infile) # Assume comma delimiter for data rows

        # Verify expected columns are present (case-insensitive check just in case)
        # Use lowercase for comparison as DictReader might lowercase them
        header_lower = {h.lower() for h in reader.fieldnames} if reader.fieldnames else set()
        required_columns_lower = {"fips", "state", "county", "variable_code", "value"}

        if not required_columns_lower.issubset(header_lower):
             # Find which specific required columns are missing based on original case
             actual_headers = set(reader.fieldnames) if reader.fieldnames else set()
             required_columns_orig_case = ["FIPS", "State", "County", "Variable_Code", "Value"]
             missing = [col for col in required_columns_orig_case if col not in actual_headers]
             print(f"Error: Missing expected columns in CSV header: {', '.join(missing)}")
             print(f"Actual header found: {reader.fieldnames}")
             exit(1)

        for row in reader:
            # Access columns using the exact names found in the header
            # Find the correct case for keys if necessary
            fips_key_actual = next((k for k in row if k.lower() == 'fips'), None)
            var_code_key_actual = next((k for k in row if k.lower() == 'variable_code'), None)
            value_key_actual = next((k for k in row if k.lower() == 'value'), None)
            state_key_actual = next((k for k in row if k.lower() == 'state'), None)
            county_key_actual = next((k for k in row if k.lower() == 'county'), None)

            if not all([fips_key_actual, var_code_key_actual, value_key_actual, state_key_actual, county_key_actual]):
                 print("Warning: Could not find all required keys in a row, skipping.")
                 continue # Skip row if essential keys are missing

            fips_code_str = row[fips_key_actual]
            variable_code = row[var_code_key_actual]
            value_str = row[value_key_actual]
            state_val = row[state_key_actual]
            county_val = row[county_key_actual]


            if fips_code_str and variable_code and value_str is not None:
                try:
                    # Clean and pad FIPS code
                    fips_key = str(int(float(fips_code_str.strip()))).zfill(5)
                except ValueError:
                    continue # Skip rows with non-numeric FIPS

                if fips_key in target_fips and variable_code in target_indicators:
                    if fips_key not in extracted_data:
                        extracted_data[fips_key] = {
                            "FIPS": fips_key,
                            "State": state_val.strip() if state_val else None,
                            "County": county_val.strip() if county_val else None
                        }
                    try:
                        extracted_data[fips_key][variable_code] = float(value_str) if value_str else None
                    except (ValueError, TypeError):
                        extracted_data[fips_key][variable_code] = None

except FileNotFoundError:
    print(f"Error: Input CSV file not found at {input_csv_path}")
    exit(1)
except Exception as e:
    print(f"An error occurred during CSV processing: {e}")
    exit(1)

# Ensure the output directory exists
output_dir = os.path.dirname(output_json_path)
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

try:
    with open(output_json_path, mode='w', encoding='utf-8') as outfile:
        output_list = list(extracted_data.values())
        json.dump(output_list, outfile, indent=2)
    print(f"Successfully extracted data for {len(output_list)} counties to {output_json_path}")
except Exception as e:
    print(f"An error occurred writing JSON output: {e}")
    exit(1)
