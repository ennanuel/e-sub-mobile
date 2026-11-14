export const dateOrTimeAgo = (ts: string, data?: string) => {
  const d = new Date(); // Gets the current time
  const nowTs = Math.floor(d.getTime() / 1000); // getTime() returns milliseconds, and we need seconds, hence the Math.floor and division by 1000
  const seconds = nowTs - Math.floor(new Date(ts).getTime() / 1000);

  if (seconds >= 2 * 24 * 3600) {
    let datee = '';
    if (data) {
      datee = data;
    } else {
      datee = `${new Date(ts).getDate().toString().padStart(2, '0')}/${(new Date(ts).getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${new Date(ts).getFullYear().toString()}`;
    }
    return datee;
  }
  if (seconds > 24 * 3600) {
    return 'Yesterday';
  }

  if (seconds >= 3600) {
    const h = seconds / 3600;
    return `${parseInt(h?.toString())} hour${parseInt(h?.toString()) > 1 ? 's' : ''} ago`;
  }

  if (seconds > 60) {
    const m = seconds / 60;
    return `${Math.floor(m)} minute${m > 1 ? 's' : ''} ago`;
  }
};
