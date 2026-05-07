import csv

input_csv_path = "automation_lab_export.csv"
output_csv_path = "automation_lab_export.cleaned.csv"
column_1_to_clean = "Source"
column_2_to_clean = "Type"

input_file = open(input_csv_path, newline="", encoding="utf-8")
csv_reader = csv.DictReader(input_file)

headers = csv_reader.fieldnames
if headers is None:
    print("Error: CSV has no header row.")
    input_file.close()
    quit()

if column_1_to_clean not in headers or column_2_to_clean not in headers:
    print("Error: missing expected column(s).")
    print("Expected:", column_1_to_clean, "and", column_2_to_clean)
    print("Found headers:", headers)
    input_file.close()
    quit()

output_file = open(output_csv_path, "w", newline="", encoding="utf-8")
csv_writer = csv.DictWriter(output_file, fieldnames=headers)
csv_writer.writeheader()

for row in csv_reader:
    if row.get(column_1_to_clean):
        row[column_1_to_clean] = row[column_1_to_clean].strip().lower()
    if row.get(column_2_to_clean):
        row[column_2_to_clean] = row[column_2_to_clean].strip().lower()
    csv_writer.writerow(row)

input_file.close()
output_file.close()

print("Done! Wrote:", output_csv_path)
