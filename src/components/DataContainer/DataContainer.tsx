import React, { useState, useEffect, useMemo } from "react";
import CatalogueCard from "../CatalogueCard/CatalogueCard";
import styles from "./DataContainer.module.css";
import { HttpReq } from "../../services/apiService";
import urls from "../../urls.json";
import {
  Catalog,
  UserLayer,
  CardItem,
} from "../../types/allTypesAndInterfaces";
import { useCatalogContext } from "../../context/CatalogContext";
import { useUIContext } from "../../context/UIContext";
import { FeatureCollection } from "../../types/allTypesAndInterfaces";
import UserLayerCard from "../UserLayerCard/UserLayerCard";

function DataContainer() {
  const {
    selectedContainerType,
    handleAddClick,
    setGeoPoints,
    selectedLayers,
  } = useCatalogContext();
  const { closeModal } = useUIContext();
  const [activeTab, setActiveTab] = useState("Data Catalogue");
  const [resData, setResData] = useState<(Catalog | UserLayer)[] | string>("");
  const [userLayersData, setUserLayersData] = useState<UserLayer[]>([]);
  const [catalogCollectionData, setCatalogCollectionData] = useState<Catalog[]>(
    []
  );
  const [resMessage, setResMessage] = useState<string>("");
  const [resId, setResId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const [wsResMessage, setWsResMessage] = useState<string>("");
  const [wsResId, setWsResId] = useState<string>("");
  const [wsResloading, setWsResLoading] = useState<boolean>(true);
  const [wsReserror, setWsResError] = useState<Error | null>(null);

  console.log(resData, "from data container");

  useEffect(
    function () {
      var isMounted = true; // Flag to ensure we don't update state on an unmounted component

      // Fetch user layers data
      function fetchUserLayers() {
        var body = { user_id: "1845e047-9632-4243-aadf-041bfb7a7f1f" };
        HttpReq<UserLayer[]>(
          urls.user_catalogs,
          function (data) {
            if (isMounted) setUserLayersData(data);
          },
          setResMessage,
          setResId,
          setLoading,
          setError,
          "post",
          body
        );
      }

      // Fetch catalog collection data
      function fetchCatalogCollection() {
        HttpReq<Catalog[]>(
          urls.catlog_collection,
          function (data) {
            if (isMounted) setCatalogCollectionData(data);
          },
          setResMessage,
          setResId,
          setLoading,
          setError
        );
      }

      // Determine which data to fetch based on selected container type
      function fetchData() {
        setLoading(true);
        setError(null);

        if (selectedContainerType === "Layer") {
          fetchUserLayers();
        } else if (selectedContainerType === "Catalogue") {
          fetchCatalogCollection();
          fetchUserLayers();
        } else if (selectedContainerType === "Home") {
          fetchCatalogCollection();
        }

        setLoading(false);
      }

      fetchData();

      return function () {
        isMounted = false; // Cleanup function to avoid setting state on unmounted component
      };
    },
    [selectedContainerType]
  );

  useEffect(
    function () {
      // Combine catalog and user layers data based on selected container type
      if (selectedContainerType === "Catalogue") {
        var combinedData = catalogCollectionData.concat(userLayersData as any);
        if (JSON.stringify(resData) !== JSON.stringify(combinedData)) {
          setResData(combinedData);
        }
      } else if (selectedContainerType === "Layer") {
        if (JSON.stringify(resData) !== JSON.stringify(userLayersData)) {
          setResData(userLayersData);
        }
      } else if (selectedContainerType === "Home") {
        if (JSON.stringify(resData) !== JSON.stringify(catalogCollectionData)) {
          setResData(catalogCollectionData);
        }
      }
    },
    [userLayersData, catalogCollectionData, selectedContainerType]
  );

  // Filter out already selected layers from the data to be displayed
  const filteredData = useMemo(
    function () {
      return Array.isArray(resData)
        ? resData.filter(function (item) {
            return !selectedLayers.some(function (layer) {
              return (
                (item as Catalog).id === layer.id ||
                (item as UserLayer).prdcer_ctlg_id === layer.id
              );
            });
          })
        : resData;
    },
    [resData, selectedLayers]
  );

  // Handle click event on catalog card
  function handleCatalogCardClick(selectedItem: CardItem) {
    if (selectedContainerType === "Home") {
      HttpReq<FeatureCollection>(
        urls.http_catlog_data,
        setGeoPoints,
        setWsResMessage,
        setWsResId,
        setWsResLoading,
        setWsResError,
        "post",
        { catalogue_dataset_id: selectedItem.id }
      );
    }

    if (selectedContainerType !== "Home") {
      handleAddClick(
        selectedItem.id,
        selectedItem.name,
        selectedItem.typeOfCard
      );
    }

    closeModal();
  }

  // Render a card based on the item type
  function makeCard(item: Catalog | UserLayer) {
    if ("prdcer_ctlg_id" in item) {
      // Render UserLayerCard if item is a user layer
      return (
        <UserLayerCard
          key={item.ctlg_owner_user_id}
          id={item.prdcer_ctlg_id}
          name={item.prdcer_ctlg_name}
          description={item.ctlg_description}
          price={item.subscription_price}
          typeOfCard="layer"
          onMoreInfo={function () {
            handleCatalogCardClick({
              id: item.prdcer_ctlg_id,
              name: item.prdcer_ctlg_name,
              typeOfCard: "layer",
            });
          }}
        />
      );
    } else {
      // Render CatalogueCard if item is a catalog
      return (
        <CatalogueCard
          key={item.id}
          id={item.id}
          thumbnail_url={item.thumbnail_url}
          name={item.name}
          records_number={item.records_number}
          description={item.description}
          onMoreInfo={function () {
            handleCatalogCardClick({
              id: item.id,
              name: item.name,
              typeOfCard: "catalog",
            });
          }}
          can_access={item.can_access}
          typeOfCard="catalog"
        />
      );
    }
  }

  // Render cards based on filtered data
  function renderCards() {
    if (typeof filteredData === "string") {
      return <div>{filteredData}</div>;
    }

    return (
      Array.isArray(filteredData) &&
      filteredData.map(function (item) {
        return makeCard(item);
      })
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.dataContainer}>
      <h2 className={styles.dataHeading}>
        {selectedContainerType === "Catalogue" ||
        selectedContainerType === "Home"
          ? "Add Data to Map"
          : "Add Layers to Map"}
      </h2>
      <div className={styles.tabMenu}>
        <button
          className={
            activeTab === "Data Catalogue" || activeTab === "Data Layer"
              ? styles.activeTab
              : styles.tabButton
          }
          onClick={function () {
            setActiveTab(
              selectedContainerType === "Catalogue"
                ? "Data Catalogue"
                : "Data Layer"
            );
          }}
        >
          {selectedContainerType === "Catalogue" || "Home"
            ? "Data Catalogue"
            : "Data Layer"}
        </button>
        <button
          className={
            activeTab === "Load Files" ? styles.activeTab : styles.tabButton
          }
          onClick={function () {
            setActiveTab("Load Files");
          }}
        >
          Load Files
        </button>
        <button
          className={
            activeTab === "Connect Your Data"
              ? styles.activeTab
              : styles.tabButton
          }
          onClick={function () {
            setActiveTab("Connect Your Data");
          }}
        >
          Connect Your Data
        </button>
      </div>
      {activeTab === "Data Catalogue" || activeTab === "Data Layer" ? (
        <div className={styles.dataGrid}>{renderCards()}</div>
      ) : activeTab === "Load Files" ? (
        <div className={styles.placeholderContent}>Load Files Content</div>
      ) : (
        <div className={styles.placeholderContent}>
          Connect Your Data Content
        </div>
      )}
    </div>
  );
}

export default DataContainer;
