export function formDataToObject(formData: FormData) {
  const data: Record<string, string> = {};
  formData.forEach((value, key) => {
    data[key] = String(value);
  });
  return data;
}
