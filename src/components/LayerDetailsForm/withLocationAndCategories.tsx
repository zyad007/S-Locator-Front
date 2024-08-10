import React, { useState, useEffect } from 'react';
import { HttpReq } from '../../services/apiService';
import urls from '../../urls.json';
import { City, CategoryData } from '../../types/allTypesAndInterfaces';
import { processCityData } from '../../utils/helperFunctions';

export interface WithLocationAndCategoriesProps {
  countries: string[];
  cities: City[];
  categories: CategoryData;
  firstFormData: {
    selectedCountry: string;
    selectedCity: string;
    includedTypes: string[];
    excludedTypes: string[];
  };
  handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTypeToggle: (type: string) => void;
  validateForm: (action: string) => boolean;
  setFirstFormData: React.Dispatch<React.SetStateAction<{
    selectedCountry: string;
    selectedCity: string;
    includedTypes: string[];
    excludedTypes: string[];
  }>>;
}

const withLocationAndCategories = <P extends WithLocationAndCategoriesProps>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function WithLocationAndCategories(props: Omit<P, keyof WithLocationAndCategoriesProps>) {
    const [countries, setCountries] = useState<string[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [citiesData, setCitiesData] = useState<{ [country: string]: City[] }>({});
    const [categories, setCategories] = useState<CategoryData>({});
    const [firstFormData, setFirstFormData] = useState<{
      selectedCountry: string;
      selectedCity: string;
      includedTypes: string[];
      excludedTypes: string[];
    }>({
      selectedCountry: '',
      selectedCity: '',
      includedTypes: [],
      excludedTypes: [],
    });
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      fetchData();
    }, []);

    function fetchData() {
      HttpReq<string[]>(
        urls.country_city,
        (data) => setCountries(processCityData(data, setCitiesData)),
        () => {},
        () => {},
        () => {},
        setError
      );

      HttpReq<CategoryData>(
        urls.nearby_categories,
        setCategories,
        () => {},
        () => {},
        () => {},
        setError
      );
    }

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
      const { name, value } = event.target;

      setFirstFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      if (name === 'selectedCountry') {
        const selectedCountryCities = citiesData[value] || [];
        setCities(selectedCountryCities);

        setFirstFormData((prevData) => ({
          ...prevData,
          selectedCity: '',
        }));
      }
    }

    function handleTypeToggle(type: string) {
      setFirstFormData((prevData) => {
        if (prevData.includedTypes.includes(type)) {
          return {
            ...prevData,
            includedTypes: prevData.includedTypes.filter((t) => t !== type),
            excludedTypes: [...prevData.excludedTypes, type],
          };
        } else if (prevData.excludedTypes.includes(type)) {
          return {
            ...prevData,
            excludedTypes: prevData.excludedTypes.filter((t) => t !== type),
          };
        } else {
          return {
            ...prevData,
            includedTypes: [...prevData.includedTypes, type],
          };
        }
      });
    }

    function validateForm(action: string) {
      if (!firstFormData.selectedCountry || !firstFormData.selectedCity) {
        setError(new Error('Country and city are required.'));
        return false;
      }

      if (firstFormData.includedTypes.length === 0 && firstFormData.excludedTypes.length === 0) {
        setError(new Error('At least one category must be included or excluded.'));
        return false;
      }

      if (firstFormData.includedTypes.length > 50 || firstFormData.excludedTypes.length > 50) {
        setError(new Error('Up to 50 types can be specified in each type restriction category.'));
        return false;
      }

      setError(null);
      return true;
    }

    return (
      <WrappedComponent
        {...(props as P)}
        countries={countries}
        cities={cities}
        categories={categories}
        firstFormData={firstFormData}
        handleChange={handleChange}
        handleTypeToggle={handleTypeToggle}
        validateForm={validateForm}
        setFirstFormData={setFirstFormData}
      />
    );
  };
};

export default withLocationAndCategories;