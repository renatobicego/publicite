function parseTimeX(start_date: string, frequency: number): { start_date_parsed: string, end_date_parsed: string } {
    const start_date_in_date = new Date(start_date);
    if (!frequency) frequency = 0;
    start_date_in_date.setDate(start_date_in_date.getDate() + frequency);
    let end_date = start_date_in_date.toISOString();
    return { start_date_parsed: start_date.split('T')[0], end_date_parsed: end_date.split('T')[0] };
}

export default parseTimeX