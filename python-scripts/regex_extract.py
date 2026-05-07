import re

text_to_parse = """Contact: stan.example+jobs@gmail.com
Phone: +1 (416) 555-0123 ext 204
Alternate: 416-555-0199
"""

email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
phone_pattern = r"\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3}[\s.-]?\d{4}(?:\s*(?:ext|x|extension)\s*\d{1,6})?\b"

emails_found = re.findall(email_pattern, text_to_parse)
phones_found = re.findall(phone_pattern, text_to_parse, flags=re.IGNORECASE)

unique_emails = []
for e in emails_found:
    if e not in unique_emails:
        unique_emails.append(e)

unique_phones = []
for p in phones_found:
    p = p.strip()
    if p not in unique_phones:
        unique_phones.append(p)

first_email = unique_emails[0] if unique_emails else ""
first_phone = unique_phones[0] if unique_phones else ""

print("All emails found:", unique_emails)
print("All phones found:", unique_phones)
print("First email:", first_email)
print("First phone:", first_phone)
