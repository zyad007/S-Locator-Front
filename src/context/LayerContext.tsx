// src/context/LayerContext.tsx


import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from "react";
import { HttpReq } from "../services/apiService";
import {
  CreateLayerResponse,
  LayerContextType,
  SaveResponse,
  FormData,
  City,
  CategoryData
} from "../types/allTypesAndInterfaces";
import urls from "../urls.json";
import { useCatalogContext } from "./CatalogContext";
import userIdData from "../currentUserId.json";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { processCityData } from '../utils/helperFunctions';


const LayerContext = createContext<LayerContextType | undefined>(undefined);


export function LayerProvider(props: { children: ReactNode }) {
  const navigate = useNavigate();
  const { authResponse } = useAuth(); // Add this line
  const { children } = props;
  const { geoPoints, setGeoPoints } = useCatalogContext();
  // State from useLocationAndCategories
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesData, setCitiesData] = useState<{ [country: string]: City[] }>({});
  const [categories, setCategories] = useState<CategoryData>({});
  const [firstFormData, setFirstFormData] = useState<FormData>({
    selectedCountry: '',
    selectedCity: '',
    includedTypes: [],
    excludedTypes: [],
  });
  const [secondFormData, setSecondFormData] = useState({
    legend: "",
    description: "",
    name: "",
  });

  const [formStage, setFormStage] = useState<string>("initial");
  const [loading, setLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<Error | null>(null);
  const [firstFormResponse, setFirstFormResponse] = useState<
    CreateLayerResponse | undefined
  >(undefined);
  const [saveMethod, setSaveMethod] = useState<string>("");
  const [datasetInfo, setDatasetInfo] = useState<{
    bknd_dataset_id: string;
    prdcer_lyr_id: string;
  } | null>(null);

  const [saveResponse, setSaveResponse] = useState<SaveResponse | null>(null);
  const [saveResponseMsg, setSaveResponseMsg] = useState<string>("");
  const [saveReqId, setSaveReqId] = useState<string>("");

  const [selectedColor, setSelectedColor] = useState<{
    name: string;
    hex: string;
  } | null>(null);
  const [saveOption, setSaveOption] = useState<string>("");

  const [centralizeOnce, setCentralizeOnce] = useState<boolean>(false);
  const [initialFlyToDone, setInitialFlyToDone] = useState<boolean>(false);

  const [showLoaderTopup, setShowLoaderTopup] = useState<boolean>(false);

  const [postResponse, setPostResponse] = useState<CreateLayerResponse | null>(
    null
  );
  const [postResMessage, setPostResMessage] = useState<string>("");
  const [postResId, setPostResId] = useState<string>("");

  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [textSearchInput, setTextSearchInput] = useState<string>("");
  const [searchType, setSearchType] = useState<string>("new nearby search");
  const [password, setPassword] = useState<string>("");

  const callCountRef = useRef<number>(0);
  const MAX_CALLS = 10;

  useEffect(
    function () {
      if (isError) {
        setShowLoaderTopup(false);
        callCountRef.current = 0;
      }
    },
    [isError]
  );

  function handleNextStep() {
    if (formStage === "initial") {
      setFormStage("secondStep");
    } else if (formStage === "secondStep") {
      setFormStage("thirdStep");
    }
  }

  function handleSave() {
    if (!authResponse || !('idToken' in authResponse)) {
      navigate('/auth');
      setIsError(new Error("User is not authenticated!"));
      return;
    }

    if (!datasetInfo) {
      setIsError(new Error("Dataset information is missing!"));
      console.error("Dataset information is missing!");
      return;
    }

    if (!selectedColor) {
      setIsError(new Error("Selected color is missing!"));
      console.error("Selected color is missing!");
      return;
    }

    const userId = userIdData.user_id;

    const postData = {
      prdcer_layer_name: secondFormData.name,
      prdcer_lyr_id: datasetInfo.prdcer_lyr_id,
      bknd_dataset_id: datasetInfo.bknd_dataset_id,
      points_color: selectedColor.hex,
      layer_legend: secondFormData.legend,
      layer_description: secondFormData.description,
      user_id: authResponse.localId,
    };

    setLoading(true);

    HttpReq<SaveResponse>(
      urls.save_producer_layer,
      setSaveResponse,
      setSaveResponseMsg,
      setSaveReqId,
      setLoading,
      setIsError,
      "post",
      postData,
      authResponse.idToken
    );
  }

  function resetFormStage() {
    setIsError(null);
    setFormStage("initial");
  }

  function handlePostResponse(response: CreateLayerResponse) {
    if (
      !response ||
      typeof response !== "object" ||
      !Array.isArray(response.features)
    ) {
      setIsError(new Error("Input data is not a valid GeoJSON object."));
      return;
    }

    setFirstFormResponse(function (prevResponse) {
      if (prevResponse && typeof prevResponse !== "string") {
        return {
          ...prevResponse,
          features: [...prevResponse.features, ...response.features],
        };
      }
      return {
        ...response,
        features: response.features,
      };
    });

    setGeoPoints(function (prevGeoPoints) {
      return [
        ...prevGeoPoints,
        {
          ...response,
          features: response.features,
          display: true,
        },
      ];
    });

    if (response.bknd_dataset_id && response.prdcer_lyr_id) {
      setDatasetInfo({
        bknd_dataset_id: response.bknd_dataset_id,
        prdcer_lyr_id: response.prdcer_lyr_id,
      });
    }

    if (response.next_page_token && callCountRef.current < MAX_CALLS) {
      handleFirstFormApiCall("full data", response.next_page_token);
    } else {
      setShowLoaderTopup(false);
      callCountRef.current = 0;
    }
  }

  function handleFirstFormApiCall(action: string, pageToken?: string) {
    let user_id: string;
    let idToken:string

    if (authResponse && ('idToken' in authResponse)) {
      user_id = authResponse.localId;
      idToken = authResponse.idToken
    }  else if (action=="full data"){
      navigate('/auth');
      setIsError(new Error("User is not authenticated!"));
      return
    }else {
      user_id = "0000";
      idToken = "";
      
    }

    const postData = {
      dataset_country: firstFormData.selectedCountry,
      dataset_city: firstFormData.selectedCity,
      includedTypes: firstFormData.includedTypes,
      excludedTypes: firstFormData.excludedTypes,
      action: action,
      search_type: searchType,
      ...(searchType === "text search" && {
        text_search_input: textSearchInput.trim(),
      }),
      ...(action === "full data" && { password: password }),
      ...(pageToken && { page_token: pageToken }),
      user_id: user_id
    };

    if (callCountRef.current >= MAX_CALLS) {
      setShowLoaderTopup(false);
      callCountRef.current = 0;
      return;
    }

    callCountRef.current++;

    HttpReq<CreateLayerResponse>(
      urls.create_layer,
      setPostResponse,
      setPostResMessage,
      setPostResId,
      setLocalLoading,
      setIsError,
      "post",
      postData,
      idToken
    );
  }

  useEffect(
    function () {
      if (postResponse) {
        handlePostResponse(postResponse);
      }
    },
    [postResponse]
  );

  return (
    <LayerContext.Provider
      value={{
        secondFormData,
        setSecondFormData,
        formStage,
        isError,
        firstFormResponse,
        saveMethod,
        loading,
        saveResponse,
        setFormStage,
        setIsError,
        setFirstFormResponse,
        setSaveMethod,
        setLoading,
        handleNextStep,
        handleSave,
        resetFormStage,
        selectedColor,
        setSelectedColor,
        saveOption,
        setSaveOption,
        datasetInfo,
        setDatasetInfo,
        saveResponseMsg,
        setSaveResponseMsg,
        setSaveResponse,
        setSaveReqId,
        centralizeOnce,
        setCentralizeOnce,
        initialFlyToDone,
        setInitialFlyToDone,
        showLoaderTopup,
        setShowLoaderTopup,
        handleFirstFormApiCall,
        textSearchInput,
        setTextSearchInput,
        searchType,
        setSearchType,
        password,
        setPassword,
        countries,
        setCountries,
        cities,
        setCities,
        citiesData,
        setCitiesData,
        categories,
        setCategories,
        firstFormData,
        setFirstFormData,
      }}
    >
      {children}
    </LayerContext.Provider>
  );
}

export function useLayerContext() {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error("useLayerContext must be used within a LayerProvider");
  }
  return context;
}
