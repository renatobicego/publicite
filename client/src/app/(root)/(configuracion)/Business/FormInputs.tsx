import { Field, FormikErrors } from "formik";
import { CustomInput, CustomSelect } from "@/components/inputs/CustomInputs";
import PlaceAutocomplete from "@/components/inputs/PlaceAutocomplete";
import { BusinessSector, EditBusinessProfileProps } from "@/types/userTypes";
import { useEffect, useState } from "react";
import { getBusinessSector } from "@/services/businessServices";
import { toastifyError } from "@/utils/functions/toastify";
interface PersonalDataFormInputsProps {
  initialValues: EditBusinessProfileProps;
  errors: FormikErrors<EditBusinessProfileProps>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<EditBusinessProfileProps>>;
}
const FormInputs = ({
  initialValues,
  errors,
  setFieldValue,
}: PersonalDataFormInputsProps) => {
  const [businessSectorItems, setBusinessSectorItems] = useState<
    BusinessSector[]
  >([]);

  useEffect(() => {
    const getItems = async () => {
      const res = await getBusinessSector();
      if ("error" in res) {
        toastifyError(res.error);
        setBusinessSectorItems([]);
        return;
      }
      setBusinessSectorItems(res);
    };
    if (!businessSectorItems.length) getItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Field
        as={CustomInput}
        isRequired
        name="businessName"
        label="Nombre de la Empresa - Negocio"
        aria-label="Ingrese el nombre"
        isInvalid={!!errors.businessName}
        errorMessage={errors.businessName}
      />
      <Field
        as={CustomInput}
        isRequired
        name="dni"
        label="CUIT/DNI"
        aria-label="Ingrese el CUIT de la empresa o DNI del propietario"
        isInvalid={!!errors.dni}
        errorMessage={errors.dni}
      />
      <Field
        as={CustomSelect}
        name="sector"
        isRequired
        label="Rubro de la Empresa - Negocio"
        aria-label="rubro de la empresa"
        placeholder="Seleccione el rubro"
        items={businessSectorItems}
        defaultSelectedKeys={[initialValues.sector]}
        isInvalid={!!errors.sector}
        errorMessage={errors.sector}
        getItemLabel={(item: BusinessSector) => item.label}
        getItemTextValue={(item: BusinessSector) => item.label}
        getItemValue={(item: BusinessSector) => item._id}
      />
      <Field
        as={PlaceAutocomplete}
        isRequired
        name="countryRegion"
        isInvalid={!!errors.countryRegion}
        errorMessage={errors.countryRegion}
        onSelectionChange={(value: string) =>
          setFieldValue("countryRegion", value)
        }
      />
    </>
  );
};

export default FormInputs;
