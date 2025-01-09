import {Injectable} from '@angular/core';
import {ActiveFeatureSet} from 'src/app/core/config/active-feature-set';
import {UiAssetMapped} from 'src/app/core/services/models/ui-asset-mapped';
import {LanguageSelectItemService} from '../../../form-elements/language-select/language-select-item.service';
import {AssetDatasourceFormValue} from './model/asset-datasource-form-model';
import {EditAssetFormValue} from './model/edit-asset-form-model';

import {UNDERPIN_MODEL_DATA} from "../../../../core/services/models/custom/underpin-model-data";
import {CustomJsonldProperty} from "../../../../core/services/models/custom/custom-jsonld-property";
/**
 * Handles AngularForms for Edit Asset Form
 */
@Injectable()
export class EditAssetFormInitializer {
  constructor(
    private languageSelectItemService: LanguageSelectItemService,
    private activeFeatureSet: ActiveFeatureSet,
  ) {}

  forCreate(): EditAssetFormValue {
    return {
      mode: 'CREATE',
      publishMode: 'PUBLISH_UNRESTRICTED',
      general: {
        id: '',
        name: '',
        description: '',
        keywords: [],
        dataCategory: null,
        dataSubcategory: null,
        version: '',
        contentType: '',
        language: this.languageSelectItemService.english(),
        publisher: '',
        standardLicense: '',
        endpointDocumentation: '',
        showAdvancedFields: false,
      },
      advanced: {
        dataModel: '',
        transportMode: null,
        geoReferenceMethod: '',
        conditionsForUse: '',
        dataUpdateFrequency: '',
        sovereignLegalName: '',
        geoLocation: '',
        nutsLocations: [],
        dataSampleUrls: [],
        referenceFileUrls: [],
        referenceFilesDescription: '',
        temporalCoverage: {from: null, toInclusive: null},
      },
      custom: this.underpinCustomModelOnCreate(),
      datasource: this.emptyHttpDatasource(),
    };
  }

  forEdit(asset: UiAssetMapped): EditAssetFormValue {
    return {
      mode: 'EDIT',
      publishMode: 'DO_NOT_PUBLISH',
      general: {
        id: asset.assetId,
        name: asset.title,
        description: asset.description,
        keywords: asset.keywords,
        dataCategory: asset.dataCategory,
        dataSubcategory: asset.dataSubcategory,
        version: asset.version,
        contentType: asset.mediaType,
        language: asset.language,
        publisher: asset.publisherHomepage,
        standardLicense: asset.licenseUrl,
        endpointDocumentation: asset.landingPageUrl,
        showAdvancedFields: true,
      },
      advanced: {
        dataModel: asset.dataModel,
        transportMode: asset.transportMode,
        geoReferenceMethod: asset.geoReferenceMethod,
        sovereignLegalName: asset.sovereignLegalName,
        geoLocation: asset.geoLocation,
        nutsLocations: asset.nutsLocations,
        dataSampleUrls: asset.dataSampleUrls,
        referenceFileUrls: asset.referenceFileUrls,
        referenceFilesDescription: asset.referenceFilesDescription,
        conditionsForUse: asset.conditionsForUse,
        dataUpdateFrequency: asset.dataUpdateFrequency,
        temporalCoverage: {
          from: asset.temporalCoverageFrom,
          toInclusive: asset.temporalCoverageToInclusive,
        },
      },
      custom: this.underpinCustomModelOnEdit(asset),
      datasource: this.emptyEditDatasource(asset),
    };
  }

  private underpinCustomModelOnEdit(asset: UiAssetMapped): Object{
    const customModel = {}
    for(const property of UNDERPIN_MODEL_DATA){
      // @ts-ignore
      const value = this._unstringify(asset.customJsonLdProperties.find(customProperty => customProperty.key === property.rdf_property_mapping)?.value);
      if(value){
        //TODO: fixing compacted array issue
        if(property.multipleValues && typeof value==="string"){
          // @ts-ignore
          customModel[property.id] = [value];
        }
        else{
          // @ts-ignore
          customModel[property.id] = value;
        }

      }
      else{
        // @ts-ignore
        customModel[property.id] = this.underpinCustomInitializer(property)
      }

    }
    return customModel;
  }

  private _unstringify(jsonObject: string){
    try{
      return JSON.parse(jsonObject)
    }
    catch (syntaxError){
      //this is probably just a string, we return it as-is
      return jsonObject
    }
  }

  private underpinCustomInitializer(property: CustomJsonldProperty){
    if(property.multipleValues){
      // @ts-ignore
      return [];
    }
    else{
      // @ts-ignore
      return '';
    }
  }

  private underpinCustomModelOnCreate(): Object{
    const customModel = {}
    for(const property of UNDERPIN_MODEL_DATA){
        // @ts-ignore
        customModel[property.id] = this.underpinCustomInitializer(property);
    }
    return customModel;
  }



  private emptyHttpDatasource(): AssetDatasourceFormValue {
    return {
      dataSourceAvailability: this.activeFeatureSet.hasMdsFields()
        ? 'On-Request'
        : 'Datasource',
      contactEmail: '',
      contactPreferredEmailSubject: '',

      dataAddressType: 'Http',
      dataDestination: '',

      httpUrl: '',
      httpMethod: 'GET',
      httpAuthHeaderType: 'None',
      httpAuthHeaderName: '',
      httpAuthHeaderValue: '',
      httpAuthHeaderSecretName: '',
      httpQueryParams: [],

      httpDefaultPath: '',
      httpProxyMethod: false,
      httpProxyPath: false,
      httpProxyQueryParams: false,
      httpProxyBody: false,

      httpHeaders: [],
    };
  }

  private emptyEditDatasource(asset: UiAssetMapped): AssetDatasourceFormValue {
    return {
      ...this.emptyHttpDatasource(),
      dataSourceAvailability:
        asset.dataSourceAvailability === 'LIVE' ? 'Unchanged' : 'On-Request',
      contactEmail: asset.onRequestContactEmail ?? '',
      contactPreferredEmailSubject: asset.onRequestContactEmailSubject ?? '',
    };
  }
}
