from datetime import date
import re
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


def validate_registration(data):
    errors = {}
    username = str(data.get('username', '')).strip()
    full_name = str(data.get('full_name', '')).strip()
    email = str(data.get('email', '')).strip()
    password = str(data.get('password', ''))
    phone = str(data.get('phone', '')).strip()
    birthday = str(data.get('birthday', '')).strip()

    if len(username) < 5:
        errors['username'] = 'Логін повинен містити щонайменше 5 символів.'
    elif len(username) > 30:
        errors['username'] = 'Логін не може перевищувати 30 символів.'

    if not full_name or not all(ch.isalpha() for ch in full_name):
        errors['full_name'] = 'Ім’я повинно містити лише літери.'

    if len(password) < 8 or not re.search(r'[A-ZА-ЯІЇЄҐ]', password) or not any(ch.isdigit() for ch in password):
        errors['password'] = 'Пароль: мінімум 8 символів, одна велика літера та одна цифра.'

    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@.]+', email):
        errors['email'] = 'Введіть коректний email з @ та доменом.'

    # Додаткове правило: у методичці поле телефону згадано, але конкретних умов немає.
    if not re.fullmatch(r'\+?[0-9]{9,15}', phone):
        errors['phone'] = 'Телефон: 9–15 цифр, на початку можливий +.'

    try:
        birth_date = date.fromisoformat(birthday)
        if birth_date > date.today():
            errors['birthday'] = 'Дата народження не може бути в майбутньому.'
    except ValueError:
        errors['birthday'] = 'Вкажіть коректну дату народження.'

    return errors


@app.get('/')
def index():
    return render_template('index.html')


@app.post('/register')
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({'success': False, 'message': 'Некоректний формат запиту.'}), 400

    errors = validate_registration(data)
    if errors:
        return jsonify({'success': False, 'errors': errors}), 400

    # Демонстраційна робота: дані НЕ зберігаються у базі, паролі НЕ записуються.
    return jsonify({'success': True, 'message': 'Дані успішно пройшли перевірку! Реєстрація демонстраційна.'})


if __name__ == '__main__':
    app.run(debug=True)
