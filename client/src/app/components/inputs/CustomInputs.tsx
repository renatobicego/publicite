import {
  DateInput,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import { FieldInputProps, FormikProps } from "formik";
import { I18nProvider } from "@react-aria/i18n";
import { parseDate } from "@internationalized/date";
export const CustomInput = ({
  field,
  form,
  ...props
}: {
  field: FieldInputProps<any>;
  form: FormikProps<any>;
}) => {
  return (
    <Input
      variant="bordered"
      className="px-4 py-[10px] border-[0.5px]"
      classNames={{
        inputWrapper: "shadow-none hover:shadow-sm border-[0.5px]",
        label: "font-medium text-[0.8125rem]",
      }}
      radius="full"
      labelPlacement="outside"
      {...field}
      {...props}
    />
  );
};

export const CustomTextarea = ({
  field,
  form,
  ...props
}: {
  field: FieldInputProps<any>;
  form: FormikProps<any>;
}) => {
  return (
    <Textarea
      classNames={{
        inputWrapper: "shadow-none hover:shadow-sm border-[0.5px]",
        label: "font-medium text-[0.8125rem]",
      }}
      variant="bordered"
      radius="full"
      labelPlacement="outside"
      {...field}
      {...props}
    />
  );
};

export const CustomDateInput = (props: FieldInputProps<any>) => {
  return (
    <I18nProvider locale="es">
      <DateInput
        {...props}
        classNames={{
          inputWrapper: "shadow-none hover:shadow-sm border-[0.5px]",
          label: "font-medium text-[0.8125rem]",
        }}
        radius="full"
        variant="bordered"
        labelPlacement="outside"
        value={props.value ? parseDate(props.value) : null}
      />
    </I18nProvider>
  );
};

interface CustomSelectProps<T> {
  field: FieldInputProps<any>;
  form: FormikProps<any>;
  items: T[];
  getItemLabel: (item: T) => string;
  getItemValue: (item: T) => string;
  getItemTextValue?: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode; // New prop for custom rendering
}

export const CustomSelect = <T extends unknown>({
  field,
  form,
  items,
  getItemLabel,
  getItemValue,
  getItemTextValue,
  renderItem,
  ...props
}: CustomSelectProps<T>) => {
  return (
    <Select
      scrollShadowProps={{
        hideScrollBar: false,
      }}
      classNames={{
        trigger: "shadow-none hover:shadow-sm border-[0.5px]",
        label: "font-medium text-[0.8125rem]",
      }}
      radius="full"
      variant="bordered"
      labelPlacement="outside"
      {...field}
      {...props}
    >
      {items.map((item, index) => (
        <SelectItem
          key={getItemValue(item)}
          value={getItemValue(item)}
          variant="light"
          aria-label={getItemLabel(item)}
          textValue={getItemTextValue ? getItemTextValue(item) : undefined}
        >
          {renderItem ? renderItem(item) : getItemLabel(item)}
        </SelectItem>
      ))}
    </Select>
  );
};