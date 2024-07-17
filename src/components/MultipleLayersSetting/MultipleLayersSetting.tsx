import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import styles from "./MultipleLayersSetting.module.css";
import ColorSelect from "../ColorSelect/ColorSelect";
import { useCatalogContext } from "../../context/CatalogContext";
import { MultipleLayersSettingProps } from "../../types/allTypesAndInterfaces";

function MultipleLayersSetting(props: MultipleLayersSettingProps) {
  var layerIndex = props.layerIndex;
  var {
    selectedLayers,
    setSelectedLayers,
    setCurrentlySelectedLayer,
    geoPoints,
    setGeoPoints,
    setTempGeoPointsList,
    updateLayerDisplay,
  } = useCatalogContext();
  var layer = selectedLayers[layerIndex];
  var { id, name, is_zone_lyr, display } = layer;

  var [isZoneLayer, setIsZoneLayer] = useState(is_zone_lyr);
  var [isDisplay, setIsDisplay] = useState(display);

  useEffect(
    function () {
      setIsZoneLayer(layer.is_zone_lyr);
      setIsDisplay(layer.display);
    },
    [layer.is_zone_lyr, layer.display]
  );

  function handleZoneLayerChange() {
    var updatedLayers = selectedLayers.map(function (layer, index) {
      return index === layerIndex
        ? { ...layer, is_zone_lyr: !isZoneLayer }
        : layer;
    });
    setSelectedLayers(updatedLayers);
    setIsZoneLayer(!isZoneLayer);
    setCurrentlySelectedLayer(id);
  }

  function handleDisplayChange() {
    updateLayerDisplay(layerIndex, !isDisplay);
    setIsDisplay(!isDisplay);
  }

  function handleRemoveLayer() {
    setSelectedLayers(function (prevLayers) {
      var updatedLayers = prevLayers.filter(function (_, index) {
        return index !== layerIndex;
      });
      return updatedLayers;
    });

    if (geoPoints && typeof geoPoints !== "string") {
      var updatedGeoPoints = {
        ...geoPoints,
        features: geoPoints.features.filter(function (feature) {
          return feature.properties.geoPointId !== id;
        }),
      };
      setGeoPoints(updatedGeoPoints);
    }

    setTempGeoPointsList(function (prevList) {
      return prevList.filter(function (featureCollection) {
        return !featureCollection.features.some(function (feature) {
          return feature.properties.geoPointId === id;
        });
      });
    });

    setCurrentlySelectedLayer(null);
  }

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={handleRemoveLayer}>
        <FaTrash />
      </button>
      <div className={styles.label}>
        <span className={styles.text}>{name}</span>
      </div>
      <div className={styles.colorSelectContainer}>
        <ColorSelect layerIndex={layerIndex} />
      </div>
      <div className={styles.checkboxesContainer}>
        <div className={styles.checkboxContainer}>
          <p className={styles.zl}>Zone Layer</p>
          <input
            type="checkbox"
            checked={isZoneLayer}
            onChange={handleZoneLayerChange}
            className={styles.checkbox}
          />
        </div>
        <div className={styles.checkboxContainer}>
          <p className={styles.zl}>Display</p>
          <input
            type="checkbox"
            checked={isDisplay}
            onChange={handleDisplayChange}
            className={styles.checkbox}
          />
        </div>
      </div>
    </div>
  );
}

export default MultipleLayersSetting;
