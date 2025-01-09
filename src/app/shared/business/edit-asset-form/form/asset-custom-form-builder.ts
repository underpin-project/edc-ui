import {Injectable} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {urlValidator} from 'src/app/core/validators/url-validator';
//import {validOptionalDateRange} from 'src/app/core/validators/valid-optional-date-range';
import {AssetCustomFormModel, AssetCustomFormValue} from "./model/asset-custom-form-model";

@Injectable()
export class AssetCustomFormBuilder {
  constructor(private formBuilder: FormBuilder) {}

  buildFormGroup(
    initial: AssetCustomFormValue,
  ): FormGroup<AssetCustomFormModel> {
    return this.formBuilder.nonNullable.group(

      {
        dcat_conformsTo: initial?.dcat_conformsTo!,
        dcat_theme: this.formBuilder.array(
          // @ts-ignore
          initial.dcat_theme.map((x) => this.buildRequiredUrl(x)) ?? [],
        ),
        dcterms_type: this.formBuilder.array(
          // @ts-ignore
          initial.dcterms_type.map((x) => this.buildRequiredUrl(x)) ?? [],
        ),
        prov_wasDerivedFrom: this.formBuilder.array(
          // @ts-ignore
          initial.prov_wasDerivedFrom.map((x) => this.buildRequiredUrl(x)) ?? [],
        ),

        /* nutsLocations: this.formBuilder.nonNullable.array(
           initial?.nutsLocations?.map((x) => this.buildRequiredString(x)) ?? [],
         ),
         dataSampleUrls: this.formBuilder.array(
           initial?.dataSampleUrls?.map((x) => this.buildRequiredUrl(x)) ?? [],
         ),
         dataUpdateFrequency: initial?.dataUpdateFrequency!,
         temporalCoverage: this.formBuilder.group(
           {
             from: initial?.temporalCoverage?.from || null,
             toInclusive: initial?.temporalCoverage?.toInclusive || null,
           },
           {validators: validOptionalDateRange},
         ),*/
      });
  }

  buildRequiredString(initial: string): FormControl<string> {
    return this.formBuilder.nonNullable.control(initial, Validators.required);
  }

  buildRequiredUrl(initial: string): FormControl<string> {
    return this.formBuilder.nonNullable.control(initial, [
      Validators.required,
      urlValidator,
    ]);
  }
}
