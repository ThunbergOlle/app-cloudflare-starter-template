import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  errorText?: string;
  helpText?: string;
  containerStyle?: any;
}

const TextInputComponent = (
  {
    label,
    errorText,
    helpText,
    containerStyle,
    style,
    ...props
  }: TextInputProps,
  ref: React.Ref<RNTextInput>
) => {
  const hasError = !!errorText;

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}

      <RNTextInput
        ref={ref}
        style={[styles.input, hasError && styles.inputError, style]}
        placeholderTextColor="#999"
        {...props}
      />

      {errorText && <Text style={styles.errorText}>{errorText}</Text>}

      {helpText && !errorText && (
        <Text style={styles.helpText}>{helpText}</Text>
      )}
    </View>
  );
};

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  TextInputComponent
);

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  helpText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
});
