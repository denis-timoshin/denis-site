// Число проверок в чек-листе. Отдельный модуль, чтобы не тянуть в браузер весь реестр содержимого.
export const countChecks = c => c.sections.reduce((s, sec) => s + sec.items.length, 0)
