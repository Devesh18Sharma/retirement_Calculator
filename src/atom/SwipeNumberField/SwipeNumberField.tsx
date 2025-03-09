import React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

const CustomTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    backgroundColor: "#FBC950",
    borderRadius: "5px",
  },
  "& .MuiInputBase-input": {
    textAlign: "left",
    fontSize: "22px",
    fontWeight: "bold",
    color: "#2C3E50",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#F9D46D",
  },
  "& .MuiSvgIcon-root": {
    color: "#2C3E50",
  },
});

// Extend NumericFormatProps to accept an optional `name` prop
interface ExtendedNumericProps extends NumericFormatProps {
  name?: string;
}

const NumericFormatCustom = React.forwardRef<HTMLInputElement, ExtendedNumericProps>(
  function NumericFormatCustom(props, ref) {
    const {
      onChange,
      name = "",     // default name to empty string
      min = 0,
      max,
      ...other
    } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          if (onChange) {
            // Build a minimal synthetic event
            const syntheticEvent = {
              target: {
                name,
                value: values.value,
              },
              currentTarget: {
                name,
                value: values.value,
              },
              preventDefault: () => {},
              stopPropagation: () => {},
              persist: () => {},
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(syntheticEvent);
          }
        }}
        thousandSeparator
        isAllowed={(values) => {
          if (max === undefined) return true;
          return values.value >= min && values.value <= max;
        }}
      />
    );
  }
);

interface SwipeNumberFieldProps {
  value?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  [key: string]: any;
}

export default function SwipeNumberField(props: SwipeNumberFieldProps) {
  const {
    value = 0,
    defaultValue = 0,
    suffix = "",
    prefix = "",
    onChange,
    min = 0,
    max,
    name = "",
    ...other
  } = props;

  return (
    <CustomTextField
      InputProps={{
        inputComponent: NumericFormatCustom as any,
        inputProps: {
          name,
          suffix,
          prefix,
          defaultValue,
          onChange,
          value,
          min,
          max,
        },
      }}
      {...other}
    />
  );
}
