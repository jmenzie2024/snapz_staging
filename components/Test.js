import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Test = ({
  setCategory14,
  setCategory17,
  setCategory20,
  setCategory23,
  setAll,
  setInitial17,
  setInitial20,
  setInitial23,
}) => {
  const [arrayOfCat, setArrayOfCat] = useState([]);
  const [filterr, setFilter] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    fetchQuestions3(token);
  }, []);

  const fetchQuestions3 = async (token) => {
    try {
      const response = await fetch(process.env.API_URL + "categories/filter3", {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.error) {
        sessionStorage.clear();
        router.push("/");
      }
      setFilter(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const renderCategories = (categories) => {
    let newArrayOfCat = [];

    categories.forEach((category) => {
      newArrayOfCat.push(category);

      if (category.children) {
        newArrayOfCat = [
          ...newArrayOfCat,
          ...renderCategories(category.children),
        ];
      }
    });

    return newArrayOfCat;
  };

  useEffect(() => {
    if (filterr.length > 0) {
      var topCategory = filterr.find((category) => category.id === 327);
      // console.log('top category', topCategory)
      let data = topCategory.children.filter(
        (item) => item.name == "Snapz QB 2017 NEC"
      );
      // let data1 = topCategory.children.find((item) => item.name.startsWith('Snapz QB'));
      console.log("top category data", data);

      if (topCategory) {
        const allCategories = renderCategories(topCategory.children);
        // console.log('allCategories', allCategories);

        setArrayOfCat(allCategories);
      }
    }
  }, [filterr]);

  useEffect(() => {
    if (arrayOfCat.length === 497) {
      const cat1 = arrayOfCat.slice(9, 99);
      const cat2 = arrayOfCat.slice(99, 225);
      const cat3 = arrayOfCat.slice(225, 362);
      const cat4 = arrayOfCat.slice(362, 493);
      const allCat = arrayOfCat.slice(9, 493);

      setCategory14(cat1);
      setCategory17(cat2);
      setCategory20(cat3);
      setCategory23(cat4);
      setAll(allCat);

      setInitial17(cat2);
      setInitial20(cat3);
      setInitial23(cat4);
    }
  }, [arrayOfCat]);

  useEffect(() => {
    if (arrayOfCat.length === 498) {
      const cat1 = arrayOfCat.slice(9, 99);
      const cat2 = arrayOfCat.slice(99, 226);
      const cat3 = arrayOfCat.slice(226, 363);
      const cat4 = arrayOfCat.slice(363, 494);
      const allCat = arrayOfCat.slice(9, 494);

      setCategory14(cat1);
      setCategory17(cat2);
      setCategory20(cat3);
      setCategory23(cat4);
      setAll(allCat);

      setInitial17(cat2);
      setInitial20(cat3);
      setInitial23(cat4);
    }
  }, [arrayOfCat]);

  useEffect(() => {
    if (arrayOfCat.length === 499) {
      const cat1 = arrayOfCat.slice(9, 99);
      const cat2 = arrayOfCat.slice(99, 227);
      const cat3 = arrayOfCat.slice(227, 364);
      const cat4 = arrayOfCat.slice(364, 495);
      const allCat = arrayOfCat.slice(9, 495);

      setCategory14(cat1);
      setCategory17(cat2);
      setCategory20(cat3);
      setCategory23(cat4);
      setAll(allCat);

      setInitial17(cat2);
      setInitial20(cat3);
      setInitial23(cat4);
    }
  }, [arrayOfCat]);
};

export default Test;
