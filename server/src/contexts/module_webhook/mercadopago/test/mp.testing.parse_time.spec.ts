describe('Mercadopago parse_time subscription - Test', () => {

    function parseTimeX(start_date: string, frequency: number): { start_date_parsed: string, end_date_parsed: string } {
        const start_date_in_date = new Date(start_date);
        if (isNaN(start_date_in_date.getTime())) {
            throw new Error("Invalid date format");
        }
        if (!frequency) frequency = 0;
        start_date_in_date.setDate(start_date_in_date.getDate() + frequency);
        let end_date = start_date_in_date.toISOString();
        return { start_date_parsed: start_date.split('T')[0], end_date_parsed: end_date.split('T')[0] };
    }

    it('should correctly add 7 days to the given start date', () => {
        const result = parseTimeX("2025-03-02T12:54:43.948-04:00", 7);
        expect(result.start_date_parsed).toBe("2025-03-02");
        expect(result.end_date_parsed).toBe("2025-03-09");
    });

    it('should return the same date when frequency is 0', () => {
        const result = parseTimeX("2025-03-02T12:54:43.948-04:00", 0);
        expect(result.start_date_parsed).toBe("2025-03-02");
        expect(result.end_date_parsed).toBe("2025-03-02");
    });

    it('should correctly add days crossing a month', () => {
        const result = parseTimeX("2025-02-25T12:00:00.000-04:00", 7);
        expect(result.start_date_parsed).toBe("2025-02-25");
        expect(result.end_date_parsed).toBe("2025-03-04");
    });

    it('should correctly add days crossing a year', () => {
        const result = parseTimeX("2025-12-30T12:00:00.000-04:00", 7);
        expect(result.start_date_parsed).toBe("2025-12-30");
        expect(result.end_date_parsed).toBe("2026-01-06");
    });

    it('should correctly subtract days when frequency is negative', () => {
        const result = parseTimeX("2025-03-10T12:00:00.000-04:00", -7);
        expect(result.start_date_parsed).toBe("2025-03-10");
        expect(result.end_date_parsed).toBe("2025-03-03");
    });

    it('should correctly handle different timezones', () => {
        const result = parseTimeX("2025-06-15T08:00:00.000+02:00", 10);
        expect(result.start_date_parsed).toBe("2025-06-15");
        expect(result.end_date_parsed).toBe("2025-06-25");
    });

    it('should correctly handle a leap year (February 29)', () => {
        const result = parseTimeX("2024-02-29T12:00:00.000-04:00", 1);
        expect(result.start_date_parsed).toBe("2024-02-29");
        expect(result.end_date_parsed).toBe("2024-03-01");
    });

    it('should treat undefined frequency as 0', () => {
        const result = parseTimeX("2025-03-02T12:54:43.948-04:00", undefined as unknown as number);
        expect(result.start_date_parsed).toBe("2025-03-02");
        expect(result.end_date_parsed).toBe("2025-03-02");
    });

    it('should treat null frequency as 0', () => {
        const result = parseTimeX("2025-03-02T12:54:43.948-04:00", null as unknown as number);
        expect(result.start_date_parsed).toBe("2025-03-02");
        expect(result.end_date_parsed).toBe("2025-03-02");
    });

    it('should throw an error for an invalid date format', () => {
        expect(() => parseTimeX("invalid-date", 5)).toThrow("Invalid date format");
    });

});
