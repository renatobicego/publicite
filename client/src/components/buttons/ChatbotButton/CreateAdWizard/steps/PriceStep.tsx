"use client";
import { Button, Checkbox, Select, SelectItem } from "@nextui-org/react";
import { useState } from "react";
import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import { frequencyPriceItems } from "@/utils/data/selectData";
import { AdPostType } from "../types";

interface PriceStepProps {
    postType: AdPostType;
    onSubmit: (data: {
        price?: number;
        toPrice?: number;
        frequencyPrice?: FrequencyPrice;
    }) => void;
}

const PriceStep = ({ postType, onSubmit }: PriceStepProps) => {
    const [price, setPrice] = useState("");
    const [toPrice, setToPrice] = useState("");
    const [frequencyPrice, setFrequencyPrice] = useState<
        FrequencyPrice | undefined
    >();
    const [showRange, setShowRange] = useState(false);
    const [error, setError] = useState("");

    const showFrequency = postType === "service" || postType === "petition";
    const showRangeOption = postType === "petition";

    const handleSubmit = () => {
        const priceNum = price ? Number(price) : undefined;
        const toPriceNum = toPrice ? Number(toPrice) : undefined;

        if (priceNum !== undefined && (priceNum < 1 || priceNum > 200000000)) {
            setError("El precio debe ser entre 1 y 200.000.000");
            return;
        }
        if (toPriceNum !== undefined && priceNum !== undefined && toPriceNum <= priceNum) {
            setError("El precio final debe ser mayor al precio inicial");
            return;
        }

        setError("");
        onSubmit({
            price: priceNum,
            toPrice: toPriceNum,
            frequencyPrice,
        });
    };

    return (
        <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
                <CustomInputWithoutFormik
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder={showRange ? "Precio desde" : "Precio"}
                    type="text"
                    inputMode="numeric"
                />
                {showRange && (
                    <CustomInputWithoutFormik
                        value={toPrice}
                        onChange={(e) => setToPrice(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Precio hasta"
                        type="text"
                        inputMode="numeric"
                    />
                )}
            </div>

            {showRangeOption && (
                <Checkbox
                    size="sm"
                    isSelected={showRange}
                    onChange={() => {
                        setShowRange(!showRange);
                        if (showRange) setToPrice("");
                    }}
                >
                    <span className="text-xs">Agregar rango de precios</span>
                </Checkbox>
            )}

            {showFrequency && (
                <Select
                    size="sm"
                    variant="bordered"
                    radius="lg"
                    label="Frecuencia del precio"
                    placeholder="Seleccionar frecuencia"
                    selectedKeys={frequencyPrice ? [frequencyPrice] : []}
                    onChange={(e) =>
                        setFrequencyPrice(e.target.value as FrequencyPrice || undefined)
                    }
                >
                    {frequencyPriceItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ))}
                </Select>
            )}

            {error && <p className="text-danger text-xs">{error}</p>}

            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={handleSubmit}
                    isDisabled={!price}
                    className="flex-1"
                >
                    Confirmar precio
                </Button>
                <Button
                    size="sm"
                    variant="light"
                    onPress={() => onSubmit({})}
                    className="flex-1"
                >
                    Continuar sin precio
                </Button>
            </div>
        </div>
    );
};

export default PriceStep;
