export const currentDateComponents = () => {
  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  return { currentYear, currentMonth, currentDay };
};
