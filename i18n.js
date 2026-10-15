'use strict';
window.FinanceI18n = (() => {
 const pairs = {"Личные финансы": "Personal finance", "Перейти к аналитике": "Skip to dashboard", "Путь к вашей цели": "Your path forward", "Главная навигация": "Main navigation", "К аналитике": "Dashboard", "Большие цели.": "Big ambitions.", "Каждый день.": "Every single day.", "Свобода начинается с решений.": "Freedom starts with a decision.", "Деньги — инструмент, чтобы идти своим путём.": "Make money a tool for the life you want.", "Посмотреть свою картину": "See the bigger picture", "МАЛЕНЬКИЕ ШАГИ": "SMALL STEPS", "Большая разница": "Bigger possibilities", "ДВИЖЕНИЕ ИМЕЕТ ЗНАЧЕНИЕ": "EVERY STEP COUNTS", "01 — ФОКУС НА ГЛАВНОМ": "01 — FOCUS ON WHAT MATTERS", "Листайте. Всё начинается с ясности": "Scroll. It starts with clarity", "МЕНЬШЕ ШУМА.": "LESS NOISE.", "Больше ясности": "More clarity", "Ваш следующий шаг — перед вами.": "Your next move starts here.", "02 / ВАША КАРТИНА": "02 / YOUR BIGGER PICTURE", "Путь к цели": "The path forward", "Обновить данные": "Refresh data", "Всё перед глазами": "Your money, in focus", "Личный доступ": "Private access", "Демо-режим": "Demo mode", "Демо-пространство · цифры для знакомства": "Demo space · sample data to explore", "Мои финансы в Telegram": "My finances in Telegram", "Ваши финансы — только для вас": "Your finances. For your eyes only.", "Откройте «Аналитику» из личного чата с ботом в Telegram.": "Open Analytics from your private chat with the Telegram bot.", "Открыть Telegram": "Open Telegram", "Посмотреть демо": "Explore the demo", "Период": "Period", "Месяц": "Month", "7 дней": "7 days", "Год": "Year", "Всё время": "All time", "Предыдущий месяц": "Previous month", "Следующий месяц": "Next month", "Сводка": "Overview", "Осталось от доходов": "Left from your income", "Доходы минус расходы": "Income minus expenses", "Доходы": "Income", "Расходы": "Expenses", "За выбранный период": "For the selected period", "ДИНАМИКА": "CASH FLOW", "Как движутся деньги": "Your money in motion", "График доходов и расходов": "Income and expense chart", "Доходы и расходы по дням или месяцам": "Daily or monthly income and expenses", "Средний расход в день": "Average daily spending", "Операций за период": "Transactions this period", "СТРУКТУРА": "BREAKDOWN", "Куда уходят деньги": "Where your money goes", "Откуда приходят деньги": "Where your money comes from", "Доли категорий": "Category breakdown", "Всего расходов": "Total expenses", "Всего доходов": "Total income", "ИСТОРИЯ": "ACTIVITY", "Последние операции": "Recent transactions", "Тип операций": "Transaction type", "Все": "All", "Синхронизация с Google Sheets": "Synced with Google Sheets", "BYN · Минск": "BYN · Minsk", "К началу": "Back to top", "Обновляем картину…": "Updating your picture…", "Все операции": "All transactions", "Новый результат за период": "New activity this period", "Пока без операций": "No transactions yet", "к предыдущему периоду": "vs. previous period", "Разница введённых доходов и расходов": "Recorded income minus expenses", "доходов осталось за период": "of your income left this period", "Вымышленные данные для знакомства": "Sample data for exploring", "Ожидают Google Sheets:": "Pending Google Sheets sync:", "Google Sheets · обновлено": "Google Sheets · updated", "Здесь появится динамика ваших операций": "Your cash flow will appear here", "Расходов за этот период нет": "No expenses this period", "Доходов за этот период нет": "No income this period", "Пока нет операций за этот период.": "No transactions this period yet.", "Добавьте доход или расход в чате с ботом.": "Add income or an expense in your bot chat.", "Доход": "Income", "Расход": "Expense", "Между своими счетами": "Between your accounts", "Здесь показаны последние операции. Полная история и исправление — в чате с ботом.": "Showing recent transactions. Full history and editing are in the bot chat.", "Отменённые записи исключены. Переводы себе не меняют итог доходов и расходов.": "Canceled transactions are excluded. Transfers between your accounts do not affect income or expenses.", "Долго нет ответа. Нажмите ↻, чтобы повторить.": "Taking longer than usual. Tap ↻ to try again.", "Не удалось обновить данные.": "Could not refresh your data.", "Откройте приложение заново из Telegram.": "Please reopen the app from Telegram.", "Некорректный период.": "Invalid date range.", "Данные временно недоступны. Попробуйте ещё раз.": "Data is temporarily unavailable. Please try again.", "Еда": "Groceries", "Кафе": "Cafés", "Транспорт": "Transport", "Жильё": "Housing", "Здоровье": "Health", "Одежда": "Clothing", "Связь": "Phone & internet", "Учёба": "Learning", "Развлечения": "Leisure", "Подписки": "Subscriptions", "Работа": "Work", "Подарок": "Gifts", "Родители": "Parents", "Подработка": "Side income", "Возврат": "Refunds", "Накопления": "Savings", "Другое": "Other", "Зарплата": "Salary", "Аванс": "Salary advance", "Продукты на неделю": "Weekly groceries", "Поездка по городу": "Getting around town", "Кофе с друзьями": "Coffee with friends", "Музыка и сервисы": "Music and services", "Выходные": "Weekend plans", "Аптека": "Pharmacy", "Для интерактивной аналитики включите JavaScript.": "Enable JavaScript to explore the interactive dashboard.", "Открыть бота в Telegram": "Open the Telegram bot", "Большие цели начинаются с ежедневных решений. Личные финансы, наглядная аналитика и ваш следующий шаг.": "Big ambitions start with everyday decisions. Personal finance, clear analytics, and your next move."};
 const ru = Object.keys(pairs).sort((a,b)=>b.length-a.length);
 const en = [...new Set(Object.values(pairs))].sort((a,b)=>b.length-a.length);
 const reverse = Object.fromEntries(Object.entries(pairs).map(([a,b])=>[b,a]));
 let language = 'en';
 try { language = localStorage.getItem('priorities-language') === 'ru' ? 'ru' : 'en'; } catch {}
 const originals = new WeakMap();
 function translate(text) {
   const keys = language==='en' ? ru : en, map = language==='en' ? pairs : reverse;
   if (map[text]) return map[text];
   // Replace all matches in one pass so a short word cannot rewrite its own translation.
   const pattern = keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
   return text.replace(new RegExp(pattern,'g'), value=>map[value]);
 }
 function apply(root=document.body) {
   const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
   while(walker.nextNode()) {
     const node=walker.currentNode;
     if(node.parentElement?.closest('script,style,.language-switch,[data-user-content]'
)) continue;
     let previous=originals.get(node);
     if(!previous || node.nodeValue!==previous.output) previous={input:node.nodeValue};
     const output=translate(previous.input);
     node.nodeValue=output; originals.set(node,{input:previous.input,output});
   }
   for(const node of root.querySelectorAll('[aria-label],img[alt]')) {
     for(const attr of ['aria-label','alt']) if(node.hasAttribute(attr)) node.setAttribute(attr,translate(node.getAttribute(attr)));
   }
   document.documentElement.lang=language;
   document.title=language==='en'?'PRIORITIES — Personal finance':'PRIORITIES — Личные финансы';
   document.querySelectorAll('[data-language]').forEach(b=>{
     b.classList.toggle('active',b.dataset.language===language);
     b.setAttribute('aria-pressed',String(b.dataset.language===language));
   });
 }
 function set(next) {
   language=next==='ru'?'ru':'en';
   try { localStorage.setItem('priorities-language',language); } catch {}
   apply(); dispatchEvent(new CustomEvent('finance-language-change'));
 }
 addEventListener('DOMContentLoaded',()=>{
   document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>set(b.dataset.language)));
   apply();
 });
 return {apply,translate,get language(){return language;},get locale(){return language==='ru'?'ru-RU':'en-US';}};
})();
