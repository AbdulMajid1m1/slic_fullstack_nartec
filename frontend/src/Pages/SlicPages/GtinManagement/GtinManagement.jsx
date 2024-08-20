import React, { useEffect, useState } from 'react'
import "./GtinManagement.css"
import { archivedUserColumn } from '../../../utils/datatablesource';
import listofbarcodes from '../../../Images/listofbarcodes.png'
import listoffinished from '../../../Images/listoffinished.png'
import rawmaterial from '../../../Images/rawmaterial.png'
import sold from '../../../Images/sold.png'
import DashboardTable from '../../../components/ProductsDashboardTable/ProductsDashboardTable'
import SideNav from '../../../components/Sidebar/SideNav';

const GtinManagement = () => {
  const [data, setData] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const memberDataString = sessionStorage.getItem('memberData')
  const memberData = JSON.parse(memberDataString)
  // console.log(memberData);


  // const fetchRawMaterialsData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await gs1Request.get(
  //       `/products?user_id=${memberData?.id}&product_type=raw_materials`
  //     )
  //     // console.log(response.data)
  //     setRawMaterials(response?.data || [])
  //     setIsLoading(false)
  //   } catch (err) {
  //     console.log(err)
  //     setIsLoading(false)
  //   }
  // }


  // const fetchSuppliesData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await gs1Request.get(
  //       `/products?user_id=${memberData?.id}&product_type=supplies`
  //     )
  //     // console.log(response.data)
  //     setSupplies(response?.data || [])
  //     setIsLoading(false)
  //   } catch (err) {
  //     console.log(err)
  //     setIsLoading(false)
  //   }
  // }


  // const fetchConsumablesData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await gs1Request.get(
  //       `/products?user_id=${memberData?.id}&product_type=consumables`
  //     )
  //     // console.log(response.data)
  //     setConsumables(response?.data || [])
  //     setIsLoading(false)
  //   } catch (err) {
  //     console.log(err)
  //     setIsLoading(false)
  //   }
  // }


  // const fetchFinishedData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await gs1Request.get(
  //       `/products?user_id=${memberData?.id}&product_type=finished_goods`
  //     )
  //     // console.log(response.data)
  //     setData(response?.data || [])
  //     setIsLoading(false)
  //   } catch (err) {
  //     console.log(err)
  //     setIsLoading(false)
  //   }
  // }

  useEffect(() => {
      // fetchRawMaterialsData();
      // fetchSuppliesData();
      // fetchConsumablesData();
      // fetchFinishedData();

      // auto scroll to bottom
      window.scrollTo({ top: 0, behavior: "smooth" });
  }, [])
  return (
    <div>
      <SideNav>
      <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white text-black dark:text-white">

        <div className="h-full mb-10">

          {/* <!-- Statistics Cards --> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-4 gap-4 bg-gradient-to-l from-primary">
            <div className="bg-secondary shadow-lg rounded-md flex items-center justify-between p-3 border-b-2 border-white text-white font-medium group">
              <div className="flex justify-center items-center w-14 h-14 rounded-full transition-all duration-300 transform group-hover:rotate-12">
                <img src={listofbarcodes} className='' alt='' />
              </div>
              <div className="text-right">
                {/* <span>{rawMaterials.length > 0 ? rawMaterials.length : null}</span> */}
                <span>48</span>
                <p>List of Issue Barcode</p>
              </div>
            </div>
            <div className="bg-secondary shadow-lg rounded-md flex items-center justify-between p-3 border-b-2 border-white text-white font-medium group">
              <div className="flex justify-center items-center w-14 h-14 rounded-full transition-all duration-300 transform group-hover:rotate-12">
                {/* <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-current text-blue-800 dark:text-gray-800 transform transition-transform duration-500 ease-in-out"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg> */}
                <img src={listoffinished} className='' alt='' />
              </div>
              <div className="text-right">
                {/* <span>{consumables.length > 0 ? consumables.length : null}</span> */}
                <span>45</span>
                <p>List of Finished Goods</p>
              </div>
            </div>
            <div className="bg-secondary shadow-lg rounded-md flex items-center justify-between p-3 border-b-2 border-white text-white font-medium group">
              <div className="flex justify-center items-center w-14 h-14 rounded-full transition-all duration-300 transform group-hover:rotate-12">
                <img src={rawmaterial} className='' alt='' />
              </div>
              <div className="text-right">
                {/* <span>{supplies.length > 0 ? supplies.length : null}</span> */}
                <span>40</span>
                <p>Raw Materials</p>
              </div>
            </div>
            <div className="bg-secondary shadow-lg rounded-md flex items-center justify-between p-3 border-b-2 border-white text-white font-medium group">
              <div className="flex justify-center items-center w-14 h-14 rounded-full transition-all duration-300 transform group-hover:rotate-12">
                <img src={sold} className='' alt='' />
              </div>
              <div className="text-right">
                {/* <span>{data.length > 0 ? data.length : null}</span> */}
                <span>35</span>
                <p>Products Sold</p>
              </div>
            </div>
          </div>
          {/* <!-- ./Statistics Cards --> */}

          <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-4 bg-gradient-to-r from-primary">
            {/* <!-- Social Traffic --> */}
            <div className="relative flex flex-col min-w-0 mb-4 lg:mb-0 break-words bg-gray-50 w-full shadow-lg rounded">
              <DashboardTable data={rawMaterials} columnsName={archivedUserColumn} secondaryColor="secondary" title={"List of Issue Barcode in Production"} UniqueId="barcodeInProductionId" />
            </div>

            {/* <!-- Social Traffic2 --> */}
            <div className="relative flex flex-col min-w-0 mb-4 lg:mb-0 break-words bg-gray-50  w-full shadow-lg rounded">
              <DashboardTable data={consumables} columnsName={archivedUserColumn} secondaryColor="secondary" title={"List of Finished Goods"} UniqueId="finishedGoodsId" />
            </div>

            {/* <!-- Social Traffic2 --> */}
            <div className="relative flex flex-col min-w-0 mb-4 lg:mb-0 break-words bg-gray-50 w-full shadow-lg rounded">
              <DashboardTable data={supplies} columnsName={archivedUserColumn} secondaryColor="secondary" title={"Raw Materials"} UniqueId="rawMaterialsId" />
            </div>

            {/* <!-- Social Traffic2 --> */}
            <div className="relative flex flex-col min-w-0 mb-4 lg:mb-0 break-words bg-gray-50 w-full shadow-lg rounded">
              <DashboardTable data={data} columnsName={archivedUserColumn} loading={isLoading} secondaryColor="secondary" title={"Products Sold"} UniqueId="productSoldId" />
            </div>

          </div>

        </div>
      </div>
    </SideNav>
    </div>
  )
}

export default GtinManagement