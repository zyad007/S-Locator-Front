import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaBoxOpen, FaLayerGroup } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import FetchDatasetForm from "../../components/FetchDatasetForm/FetchDatasetForm";
import CatalogForm from "../../components/CatalogFormLoader/CatalogFormLoader";
import LayerFormLoader from "../../components/LayerFormLoader/LayerFormLoader";
import CatalogMenu from "../../components/CatalogMenu/CatalogMenu";
import CatalogFormLoader from "../../components/CatalogFormLoader/CatalogFormLoader";
import DataContainer from "../../components/DataContainer/DataContainer";
import { useUIContext } from "../../context/UIContext";
import { useCatalogContext } from "../../context/CatalogContext";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const nav = useNavigate();

  const [selectedTab, setSelectedTab] = useState<'LAYER' | 'CATALOG'>('LAYER')

  const handleTabSwitch = (tab: 'LAYER' | 'CATALOG') => {
    setSelectedTab(tab);
  }


  const { openModal, resetViewState } = useUIContext();
  const [hasOpened, setHasOpened] = useState(false);

  const { setSelectedContainerType } = useCatalogContext();

  useEffect(() => {
    setSelectedContainerType('Home')
    openModal(<DataContainer />, {
      darkBackground: true,
    });
    setHasOpened(true);
  }, [])

  // useEffect(() => {
  //   if (!hasOpened) {
  //     openModal(<DataContainer />, {
  //       darkBackground: true,
  //     });
  //     setHasOpened(true);
  //   }
  // }, [hasOpened, openModal]);

  useEffect(() => {
    if (!isAuthenticated && selectedTab === 'CATALOG') nav("/auth");
  }, [selectedTab]);

  return (
    <div className="w-96 h-full pr-1 pb-1 bg-[#115740]">
      {/* Tabs */}
      <div className="w-full h-[5%] flex pt-1 select-none space-x-1 font-semibold">

        <div className={"flex justify-center items-center rounded-t-lg w-full h-full border border-slate-300 transition-all " + (
          selectedTab == 'LAYER' ? ' bg-white border-b-0 text-lg' : ' cursor-pointer bg-slate-200 border-b-slate-300 hover:bg-gray-50 text-gray-500 hover:text-black'
        )}
          onClick={() => handleTabSwitch('LAYER')}
        >
          Layer
          <span className="ml-2"><FaLayerGroup /></span>
        </div>

        <div className={"flex justify-center items-center rounded-t-lg w-full h-full border border-slate-300 transition-all " + (
          selectedTab == 'CATALOG' ? ' bg-white border-b-0 text-lg' : ' cursor-pointer bg-slate-200 border-b-slate-300  hover:bg-gray-50 text-gray-500 hover:text-black'
        )}
          onClick={() => handleTabSwitch('CATALOG')}
        >
          Catalog
          <span className="ml-2"><FaBoxOpen /></span>
        </div>

      </div>

      {/* Container */}
      <div className="w-full h-[95%] border-slate-300 border border-t-0 bg-white">
        {
          selectedTab === 'LAYER' && <LayerFormLoader />
        }

        {
          selectedTab === 'CATALOG' && <CatalogFormLoader />
        }
      </div>
    </div>
  );
};

export default Home;
