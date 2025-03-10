function getText(template: string, variables: any) {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key) => variables[key] || `{${key}}`
  );
}
