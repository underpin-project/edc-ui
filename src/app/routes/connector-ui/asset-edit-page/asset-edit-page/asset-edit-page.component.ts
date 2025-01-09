import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EMPTY, Observable, catchError, finalize, tap} from 'rxjs';
import {
  DataOfferCreationRequestPolicyEnum,
  IdResponseDto,
  UiAssetEditRequest,
} from '@sovity.de/edc-client';
import {EdcApiService} from 'src/app/core/services/api/edc-api.service';
import {AssetRequestBuilder} from 'src/app/core/services/asset-request-builder';
import {AssetService} from 'src/app/core/services/asset.service';
import {Fetched} from 'src/app/core/services/models/fetched';
import {UNDERPIN_MODEL_DATA} from "../../../../core/services/models/custom/underpin-model-data";
import {AdditionalAssetProperty, UiAssetMapped} from 'src/app/core/services/models/ui-asset-mapped';
import {NotificationService} from 'src/app/core/services/notification.service';
import {editAssetFormRequiredViewProviders} from '../../../../shared/business/edit-asset-form/edit-asset-form-required-providers';
import {EditAssetForm} from '../../../../shared/business/edit-asset-form/form/edit-asset-form';
import {EditAssetFormInitializer} from '../../../../shared/business/edit-asset-form/form/edit-asset-form-initializer';
import {EditAssetFormValue} from '../../../../shared/business/edit-asset-form/form/model/edit-asset-form-model';
import {ExpressionFormHandler} from '../../../../shared/business/policy-editor/editor/expression-form-handler';

@Component({
  selector: 'asset-edit-page',
  templateUrl: './asset-edit-page.component.html',
  providers: [EditAssetFormInitializer, AssetRequestBuilder],
  viewProviders: editAssetFormRequiredViewProviders,
})
export class AssetEditPageComponent implements OnInit {
  asset: Fetched<UiAssetMapped | undefined> = new Fetched(
    'loading',
    undefined,
    undefined,
  );
  isLoading = false;

  constructor(
    private editAssetFormInitializer: EditAssetFormInitializer,
    private form: EditAssetForm,
    private assetRequestBuilder: AssetRequestBuilder,
    private edcApiService: EdcApiService,
    private assetServiceMapped: AssetService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private expressionFormHandler: ExpressionFormHandler,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params.id) {
        this.assetServiceMapped
          .fetchAssets()
          .pipe(
            Fetched.wrap({
              failureMessage: 'Failed fetching asset list.',
            }),
          )
          .pipe(
            Fetched.map((assets): UiAssetMapped | undefined =>
              assets.find((asset) => asset.assetId === params.id),
            ),
          )
          .subscribe((asset) => {
            this.asset = asset;

            if (asset.isReady) {
              this.form.reset(
                this.editAssetFormInitializer.forEdit(asset.data!),
              );
            }
          });
      } else {
        this.form.reset(this.editAssetFormInitializer.forCreate());
        this.asset.state = 'ready';
      }
    });
  }

  onSubmit() {
    const formValue = this.form.value;

    // Workaround around disabled controls not being included in the form value
    if (formValue.mode !== 'CREATE') {
      formValue.general!.id = this.form.general.controls.id.getRawValue();
    }

    this.form.all.disable();
    this.isLoading = true;

    this._saveRequest(formValue)
      .pipe(
        tap(() => {
          this.notificationService.showInfo('Successfully saved asset');
        }),
        catchError((error) => {
          console.error('Failed saving asset!', error);
          this.notificationService.showError('Failed saving asset!');
          this.form.all.enable();
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe(() => this.router.navigate(['my-assets']));
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

  private _stringify(jsonArrayObject: AdditionalAssetProperty[]){
    // @ts-ignore
    return JSON.stringify(Object.assign({}, ...jsonArrayObject.map(property => ({[property.key]:this._unstringify(property.value)}))))
  }

  private _createAdditionalProperty(
    obj: object | undefined,
  ): AdditionalAssetProperty {
    // @ts-ignore
    const propertyKey = obj.key;
    // @ts-ignore
    const propertyValue = obj.value;
    return  {key: propertyKey,
      value:
        typeof propertyValue === 'object'
          ? JSON.stringify(propertyValue, null, 2)
          : propertyValue} as AdditionalAssetProperty;
  }

  private _createAdditionalPropertyOnCreate(
    propertyKey: string,
    propertyValue: string
  ): AdditionalAssetProperty {
    return  {key: propertyKey,
      value:
        typeof propertyValue === 'object'
          ? JSON.stringify(propertyValue, null, 2)
          : propertyValue} as AdditionalAssetProperty;
  }

  private _addAdditionalAssetProperty(
    key: string,
    value: string,
    asset: UiAssetMapped ){
    try{
      // @ts-ignore
      asset.customJsonLdProperties.find((property) => property.key === key).value = value;
    }
    catch(error){
      asset?.customJsonLdProperties.push(this._createAdditionalProperty({key:key, value:value}));
    }

  }

  /*private _addAdditionalAssetPropertyOnCreate(
    key: string,
    value: string,
    asset: UiAssetCreateRequest ){

    // @ts-ignore
    asset?.customJsonLdProperties.push(this._createAdditionalProperty({key:key, value:value}));
  }*/


  private _saveRequest(
    formValue: EditAssetFormValue,
  ): Observable<IdResponseDto> {
    const assetId = formValue.general!.id!;
    const mode = this.form.mode;
    const publishMode = formValue.publishMode!;
    if (mode === 'CREATE') {
      const customJsonLdProperties: AdditionalAssetProperty[] = [];
      const assetCreateRequest =
        this.assetRequestBuilder.buildAssetCreateRequest(formValue);

      // @ts-ignore
      UNDERPIN_MODEL_DATA.forEach(property => customJsonLdProperties.push(this._createAdditionalPropertyOnCreate(property.rdf_property_mapping, formValue["custom"][property.id])))
      //customJsonLdProperties.push(this._createAdditionalPropertyOnCreate("http://underpin/metadataStringArray", formValue["custom"]["conformsTo"]))
      // @ts-ignore
      assetCreateRequest.customJsonLdAsString = this._stringify(customJsonLdProperties)

      if (publishMode === 'PUBLISH_UNRESTRICTED') {
        return this.edcApiService.createDataOffer({
          dataOfferCreationRequest: {
            uiAssetCreateRequest: assetCreateRequest,
            policy: DataOfferCreationRequestPolicyEnum.PublishUnrestricted,
            uiPolicyExpression:
              this.expressionFormHandler.toUiPolicyExpression(),
          },
        });
      } else if (publishMode === 'PUBLISH_RESTRICTED') {
        return this.edcApiService.createDataOffer({
          dataOfferCreationRequest: {
            uiAssetCreateRequest: assetCreateRequest,
            policy: DataOfferCreationRequestPolicyEnum.PublishRestricted,
            uiPolicyExpression:
              this.expressionFormHandler.toUiPolicyExpression(),
          },
        });
      } else {
        return this.edcApiService.createDataOffer({
          dataOfferCreationRequest: {
            uiAssetCreateRequest: assetCreateRequest,
            policy: DataOfferCreationRequestPolicyEnum.DontPublish,
          },
        });
      }
    }

    if (mode === 'EDIT') {
      const asset = this.asset.data;
      // @ts-ignore
      UNDERPIN_MODEL_DATA.forEach(property => this._addAdditionalAssetProperty(property.rdf_property_mapping, formValue["custom"][property.id], asset))
      // @ts-ignore
      const customJsonLdAsString = this._stringify(asset?.customJsonLdProperties);
      const editRequest: UiAssetEditRequest = {
        ...this.assetRequestBuilder.buildAssetEditRequest(formValue),
        customJsonAsString: asset?.customJsonAsString,
        customJsonLdAsString: customJsonLdAsString,
        privateCustomJsonAsString: asset?.privateCustomJsonAsString,
        privateCustomJsonLdAsString: asset?.privateCustomJsonLdAsString,
      };

      return this.edcApiService.editAsset(assetId, editRequest);
    }

    throw new Error(`Unsupported mode: ${mode}`);
  }
}
