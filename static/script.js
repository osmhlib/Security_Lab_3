const form = document.getElementById('registration');
const result = document.getElementById('result');
const fields = ['username', 'full_name', 'email', 'password', 'phone', 'birthday'];

function showErrors(errors) {
  for (const name of fields) {
    const input = document.getElementById(name);
    const error = document.getElementById(`${name}-error`);
    error.textContent = errors[name] || '';
    input.setAttribute('aria-invalid', String(Boolean(errors[name])));
  }
}

function validate(data) {
  const errors = {};
  if (data.username.length < 5 || data.username.length > 30) errors.username = 'Логін: від 5 до 30 символів.';
  if (!data.full_name || !Array.from(data.full_name).every(c => /^\p{L}$/u.test(c))) errors.full_name = 'Ім’я повинно містити лише літери.';
  if (data.password.length < 8 || !/[A-ZА-ЯІЇЄҐ]/.test(data.password) || !/\d/.test(data.password)) errors.password = 'Пароль: мінімум 8 символів, одна велика літера та одна цифра.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@.]+$/.test(data.email)) errors.email = 'Введіть коректний email з @ та доменом.';
  if (!/^\+?[0-9]{9,15}$/.test(data.phone)) errors.phone = 'Телефон: 9–15 цифр, на початку можливий +.';
  const d = data.birthday;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!match) {
    errors.birthday = 'Вкажіть коректну дату народження.';
  } else {
    const [, year, month, day] = match.map(Number);
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date > today) {
      errors.birthday = 'Вкажіть коректну дату, не пізніше сьогоднішньої.';
    }
  }
  return errors;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  result.textContent = '';
  result.className = '';
  const data = Object.fromEntries(new FormData(form).entries());
  data.username = data.username.trim();
  data.full_name = data.full_name.trim();
  data.email = data.email.trim();
  data.phone = data.phone.trim();
  const errors = validate(data);
  showErrors(errors);
  if (Object.keys(errors).length) {
    result.textContent = 'Виправте помилки у формі.';
    result.className = 'fail';
    return;
  }
  if (form.dataset.mode === 'client-only') {
    result.textContent = 'Дані успішно пройшли перевірку JavaScript! Реєстрація демонстраційна.';
    result.className = 'success';
    return;
  }
  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    const answer = await response.json();
    if (!response.ok) {
      showErrors(answer.errors || {});
      result.textContent = answer.message || 'Сервер відхилив некоректні дані.';
      result.className = 'fail';
      return;
    }
    result.textContent = answer.message;
    result.className = 'success';
  } catch (_) {
    result.textContent = 'Не вдалося підключитися до сервера.';
    result.className = 'fail';
  }
});
