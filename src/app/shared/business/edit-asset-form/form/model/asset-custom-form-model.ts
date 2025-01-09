import {
  FormArray,
  FormControl,
  //FormGroup,
  ɵFormGroupValue,
} from '@angular/forms';
//import {TemporalCoverageFormModel} from './temporal-coverage-form-model';

/**
 * Form Model for Edit Asset Form > Custom
 * (UNDERPIN Properties)
 */
export interface AssetCustomFormModel {
  dcat_conformsTo: FormControl<string>;
  dcat_theme: FormArray<FormControl<string>>;
  dcterms_type: FormArray<FormControl<string>>;
  prov_wasDerivedFrom: FormArray<FormControl<string>>;
  /*geoReferenceMethod: FormControl<string>;
  geoLocation: FormControl<string>;
  nutsLocations: FormArray<FormControl<string>>;
  dataSampleUrls: FormArray<FormControl<string>>;
  dataUpdateFrequency: FormControl<string>;
  temporalCoverage: FormGroup<TemporalCoverageFormModel>;*/
}

/**
 * Form Value for Edit Asset Form > Custom
 */
export type AssetCustomFormValue = ɵFormGroupValue<AssetCustomFormModel>;
