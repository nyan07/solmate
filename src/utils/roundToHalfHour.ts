function roundToHalfHour(date: Date, mode: "up" | "down") {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    let value = hours + minutes / 60;

    if (mode === "up") {
        // arredonda para cima
        value = Math.ceil(value * 2) / 2;
    } else {
        // arredonda para baixo
        value = Math.floor(value * 2) / 2;
    }

    return value;
}

export { roundToHalfHour } 