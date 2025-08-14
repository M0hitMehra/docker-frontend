import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getRouteTitle, getRouteDescription } from "../../config/routes.js";

const DocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    // Update document title based on current route
    const title = getRouteTitle(location.pathname);
    const description = getRouteDescription(location.pathname);

    document.title = title;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default DocumentTitle;
