import { ComponentProps } from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import TextField from '../ui/TextField';

type Props<T extends FieldValues> = Omit<
  ComponentProps<typeof TextField>,
  'value' | 'onChangeText' | 'onBlur' | 'error' | 'ref'
> & {
  control: Control<T>;
  name: Path<T>;
};

// TextField bound to a react-hook-form field: value, errors and focus
// (via setFocus) come from the form.
function FormTextField<T extends FieldValues>({
  control,
  name,
  ...props
}: Props<T>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <TextField
      {...props}
      ref={field.ref}
      value={field.value}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}



export default FormTextField;
