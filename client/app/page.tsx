'use client'
import React, {FC,useState} from "react";
import Heading from "./utils/Heading";
import Header from "./components/Header";
import Hero from "./components/Route/Hero";

interface Props {}

const Page:FC<Props> =(props)=>{

  const [open,setOpen] = useState(false);
  const [activeItem,setActiveItem] = useState(0)
  
  return(
    <div>
      <Heading
        title="E-Learning"
        description="LMS Platform"
        keywords="E-Learning,LMS,Platform"
      />
      <Header open={open} setOpen={setOpen} activeItem={activeItem} />
      <Hero/>
    </div>
  )
};

export default Page;