function fdtojson(formData: FormData): Record<string, any> {
  const jsonObject: Record<string, any> = {};

  formData.forEach((value, key) => {
    if (jsonObject.hasOwnProperty(key)) {
      if (Array.isArray(jsonObject[key])) {
        (jsonObject[key] as any[]).push(value);
      } else {
        jsonObject[key] = [jsonObject[key], value];
      }
    } else {
      jsonObject[key] = value;
    }
  });

  return jsonObject;
}

export default fdtojson;
