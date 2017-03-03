import {async, ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {SearchFormComponent, UNDEFINED_NAME, DEFAULT_TARGET} from './search-form.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {UtilitiesModule} from '../../utilities/utilities.module';
import {SearchOptions} from './search-options';
import {StoreModule, Store} from '@ngrx/store';
import {term} from './ngrx/term.reducer';
import {SeachState} from './domain/search-event';


describe('SearchFormComponent', () => {
  let component: SearchFormComponent;

  let fixture: ComponentFixture<SearchFormComponent>;

  let mockRouter: Router;
  let store: Store<SeachState>;
  let subscribedTerm: string;

  const undefinedDefaultConfigurtion: SearchOptions = {
    name: UNDEFINED_NAME,
    target: DEFAULT_TARGET
  };

  const expectedOptions: SearchOptions = {
    name: 'unit-test',
    target: './some-path'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, UtilitiesModule, StoreModule.provideStore({term})],
      declarations: [ SearchFormComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: Router,
          useClass: class {
            navigate = jasmine.createSpy('navigate');
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(inject([Router, Store], ( router: Router,
                                       _store: Store<SeachState>) => {
    mockRouter = router;
    store = _store;
  }));


  it('will be defined', () => {
    expect(component).toBeDefined();
  });


  it('will have configured options with undefined defaults', () => {
      expect(component.configuredOptions).toEqual(undefinedDefaultConfigurtion);
  });

  describe('initialisation', () => {

    it('will keep default configuration when no options are provided', () => {
      component.ngOnInit();
      expect(component.configuredOptions).toEqual(undefinedDefaultConfigurtion);
    });

    it('will apply configuration provided as options', () => {
      expectedOptions.store = store;
      component.options = expectedOptions;

      component.ngOnInit();

      expect(component.configuredOptions).toEqual(expectedOptions);
    });

    it('will have an invalid form by default', () => {

      component.ngOnInit();

      expect(component.searchForm.valid).toBeFalsy();
    });
  });

  describe('search', () => {

    beforeEach(() => {
      expectedOptions.store = store;
      component.options = expectedOptions;
      component.ngOnInit();
      store.select(state => state.term).subscribe(term => subscribedTerm = term);
    });

    describe('when no valid input is provided', () => {


      it('will be able to be called and navigate away', () => {
        component.search();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
      });

      it('will not change the subscribed term', () => {
        component.search();
        expect(subscribedTerm).toEqual('');
      });

    });

    describe('when valid input is provided', () => {

      const searchTerm = 'find-me';
      const expectedQueryParameters = {queryParams: {q : searchTerm}};

      beforeEach(() => {
        component.terms = searchTerm;
        fixture.detectChanges();
      });

      it('will define the form to be valid', () => {
        expect(component.searchForm.valid).toBeTruthy();
      });


      it('will navigate to the configured target', () => {
        component.search();
        expect(mockRouter.navigate).toHaveBeenCalledWith([expectedOptions.target], expectedQueryParameters);
      });

      it('will update a subscribed term', () => {
        component.search();
        expect(subscribedTerm).toEqual(searchTerm);
      });

    });

  });

});
