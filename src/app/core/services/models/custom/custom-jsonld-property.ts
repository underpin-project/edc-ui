export interface CustomJsonldProperty {
  id:string;
  label_en:string;
  label_gr:string;
  description_en:string;
  description_gr:string;
  rdf_property_mapping:string;
  type:string;
  multipleValues: boolean,
  lookup_url:string;
  placeholder:string;
  rdf_value_type:string;
  required:boolean;
}
