import {CustomJsonldProperty} from "./custom-jsonld-property";

export const UNDERPIN_MODEL_DATA: CustomJsonldProperty[] = [
  {
    id:'dcat_conformsTo',
    label_en:'Conforms to Schema',
    label_gr:'Ακολουθεί το σχήμα',
    description_en:'Use to define the data model the asset follows, in case of a CSV file this could be a CSVW description provided by the data modeler',
    description_gr:'Use to define the data model the asset follows, in case of a CSV file this could be a CSVW description provided by the data modeler',
    rdf_property_mapping:'http://www.w3.org/ns/dcat#conformsTo',
    type:'text',
    multipleValues: false,
    lookup_url:'',
    placeholder:'',
    rdf_value_type:'resource',
    required:false
  },
  {
    id:'dcat_theme',
    label_en:'Theme',
    label_gr:'Θέμα',
    description_en:'You can select multiple themes from a predefined Concept Scheme. Click on "Add Item" to add a new theme',
    description_gr:'You can select multiple themes from a predefined Concept Scheme. Click on "Add Item" to add a new theme',
    rdf_property_mapping:'http://www.w3.org/ns/dcat#theme',
    type:'text',
    multipleValues: true,
    lookup_url:'',
    placeholder:'',
    rdf_value_type:'resource',
    required:false
  },
  {
    id:'dcterms_type',
    label_en:'Type',
    label_gr:'Type',
    description_en:'The nature or genre of the resource. You can also use this to define that this dataset is a dcat:DatasetSeries. Please not that this maps to dcterms:type and not rdf:type.',
    description_gr:'The nature or genre of the resource. You can also use this to define that this dataset is a dcat:DatasetSeries. Please not that this maps to dcterms:type and not rdf:type.',
    rdf_property_mapping:'http://purl.org/dc/terms/type',
    type:'text',
    multipleValues: true,
    lookup_url:'',
    placeholder:'http://www.w3.org/ns/dcat#DatasetSeries',
    rdf_value_type:'resource',
    required:false
  },
  {
    id:'prov_wasDerivedFrom',
    label_en:'Was Derived from',
    label_gr:'Είναι παράγωγο από',
    description_en:'A derivation is a transformation of an entity into another, an update of an entity resulting in a new one, or the construction of a new entity based on a pre-existing entity.',
    description_gr:'A derivation is a transformation of an entity into another, an update of an entity resulting in a new one, or the construction of a new entity based on a pre-existing entity.',
    rdf_property_mapping:'http://www.w3.org/ns/prov#wasDerivedFrom',
    type:'text',
    multipleValues: true,
    lookup_url:'',
    placeholder:'',
    rdf_value_type:'resource',
    required:false
  },
];
