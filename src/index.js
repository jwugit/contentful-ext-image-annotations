/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { TextInput, Select, Option, Button, Dropdown, DropdownList, DropdownListItem,  Icon, TextLink } from '@contentful/forma-36-react-components';
import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './styles.sass';
import Annotations from "react-annotation/lib/index"

const widthOptions = {
  large: [500, 600, 700, 800, 1024, 1440],
  small: [320, 375, 414],
}


export const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearInterval(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

export class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  };

  detachExternalChangeHandler = null;

  constructor(props) {
    super(props);
    this.state = {
      annotationsData: props.sdk.field.getValue() || {},
      selectedImage: 'desktop',
      selectedImageAnnotation: '',
      toggleEdit: true,
      toggleShow: true,
    };

    this.imageRef = React.createRef();

  }

  componentDidMount() {
    // console.log("componentDidMount")
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange);
    if(this.state.annotationsData && this.state.annotationsData.imageSrcId) {
      this.setImageUrls(this.state.annotationsData.imageSrcId);
    }
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  componentDidUpdate() {
    // Typical usage (don't forget to compare props):
    // if (this.props.userID !== prevProps.userID) {
    //   this.fetchData(this.props.userID);
    // }

    const nowId = (this.props.sdk.field.getValue() || {}).imageSrcId;

    // console.log("nowId", nowId)
    // console.log("this.state.imgSourceId", this.state.imgSourceId)

    if(nowId && this.state.imgSourceId && nowId !== this.state.imgSourceId) {
      // console.log("difffffffffffffffffffffffff")
      this.debounceSetImageUrls(nowId)
    }

  }

  onExternalChange = value => {
    this.setState({ annotationsData: value });
  };

  deleteAnnotationData = () => {
    this.props.sdk.field.removeValue();
    this.setState({
      annotationsData: {},
      selectedImage: 'desktop',
      selectedImageAnnotation: '',
      toggleEdit: true,
      toggleShow: true,
      imageFile:  '',
      imageFileTablet: '',
      imageFileMobile: '',
    });
  }

  updateAnnotationDataForProp = (propName, data) => {
    if(propName) {
      const annotationsData = this.props.sdk.field.getValue() || {};
      annotationsData[propName] = data;
      this.props.sdk.field.setValue(annotationsData);
    }
  };

  updateAnnotationDataForImg = (selectedImage, data, type) => {
    if(selectedImage) {
      const annotationsData = this.props.sdk.field.getValue() || {};
      annotationsData[selectedImage] = annotationsData[selectedImage] || {};
      annotationsData[selectedImage][type] = data;
      // this.setState({ annotationsData: annotationsData });
      if (data) {
        this.props.sdk.field.setValue(annotationsData);
      }
      // else {
      //   this.props.sdk.field.removeValue();
      // }
    }
  };
  debounceSetImageUrls = debounce(value => {
    this.setImageUrls(value);
  }, 500);
  setImageUrls = (id) => {
    this.fetchImageUrls(id)
      .then(data => {
        this.setState(data);
      }, () => {
        this.removeSetUmageUrls();
      })
      .catch(() => {
        this.removeSetUmageUrls();
      })
  }

  removeSetUmageUrls = () => {
    this.setState({
      imageFile:  '',
      imageFileTablet: '',
      imageFileMobile: '',
    })
  }

  fetchImageUrls = async (imgSourceId) => {
    // check for image_source_id
    if(imgSourceId) {
        // get the entry
        const { fields } = await this.props.sdk.space.getEntry(imgSourceId);
        const { imageFile: f1, imageFileTablet: f2, imageFileMobile: f3 } = fields || {};
        const locale =  this.props.sdk.field.locale;
        // get each image media file
        const { fields: img1 } = f1 && f1[locale] && f1[locale].sys && f1[locale].sys.linkType === "Asset" && f1[locale].sys.id && await this.props.sdk.space.getAsset(f1[locale].sys.id) || {};
        const { fields: img2 } = f2 && f2[locale] && f2[locale].sys && f2[locale].sys.linkType === "Asset" && f2[locale].sys.id && await this.props.sdk.space.getAsset(f2[locale].sys.id) || {};
        const { fields: img3 } = f3 && f3[locale] && f3[locale].sys && f3[locale].sys.linkType === "Asset" && f3[locale].sys.id && await this.props.sdk.space.getAsset(f3[locale].sys.id) || {};

        return {
          imgSourceId: imgSourceId,
          imageFile: img1 && img1.file && img1.file[locale] && img1.file[locale].url || '',
          imageFileTablet: img2 && img2.file && img2.file[locale] && img2.file[locale].url || '',
          imageFileMobile: img3 && img3.file && img3.file[locale] && img3.file[locale].url || '',
        }
      }
  }

  selectDesktopImage = () => {
    this.setState({selectedImage: 'desktop'})
  }
  selectTabletImage = () => {
    this.setState({selectedImage: 'tablet'})
  }
  selectMobileImage = () => {
    this.setState({selectedImage: 'mobile'})
  }

  defaultAnnotation = newId => {
    return  {
      id: newId,
      x:50,
      y:50,
      dy:50,
      dx:50,
      radius: 20,
      color: "#000000",
      title: "type title here",
      label: "type label here",
      connect: "elbow",
      end: "",
      lineType: "horizontal",
      align: "left",
      titleSize: 18,
      strokeWidth: 2,
    }
  }
  getAnnotationData = (selectedImage, type) => {
    // const annotationsData = this.props.sdk.field.getValue() || {};
    const annotationsData = this.state.annotationsData;
    annotationsData[selectedImage] = annotationsData[selectedImage] || { width: 'auto'};
    return annotationsData[selectedImage][type] || {};
  }

  addAnnotation = () => {
    const { selectedImage } = this.state
    if(selectedImage) {
      const annotationsAdded = this.getAnnotationData(selectedImage, "annotations");
      const existingIds = Math.max(...Object.keys(annotationsAdded).map(k => annotationsAdded[k].id), 0);
      const newId = existingIds + 1;
      const newAnnotation = this.defaultAnnotation(newId);
      annotationsAdded[newAnnotation.id] = newAnnotation;
      this.setState({selectedImageAnnotation: {target: selectedImage, id: newAnnotation.id}});
      this.updateAnnotationDataForImg(selectedImage, annotationsAdded, "annotations");
    }
  }
  deleteAnnotation = () => {
    const { selectedImageAnnotation } = this.state
    const {target, id} = selectedImageAnnotation || {}
    if(target && id) {
      const annotationsAdded = this.getAnnotationData(target, "annotations");
      if(id && annotationsAdded[id]) {
        delete annotationsAdded[id];
        this.setState({selectedImageAnnotation: ''});
        this.updateAnnotationDataForImg(target, annotationsAdded, "annotations");
      }
    }
  }
  unSelectAnnotation = () => {
    this.setState({selectedImageAnnotation: {}});
  }
  updateAnnotation = a => {
    const { selectedImage } = this.state
    const annotationsAdded = this.getAnnotationData(selectedImage, "annotations");
    if(a && a.id && annotationsAdded[a.id]) {
      annotationsAdded[a.id] = {...annotationsAdded[a.id], ...a};
      // console.log("annotationsAdded[a.id]", annotationsAdded[a.id])
      this.updateAnnotationDataForImg(selectedImage, annotationsAdded, "annotations");
    }
  }
  debounceTryChnageText = debounce(value => {
    this.updateAnnotation(value);
  }, 1000);
  updateAnnotationPropsDebounced = (prop, value) => {
    const {selectedImageAnnotation} = this.state;
    if(selectedImageAnnotation && selectedImageAnnotation.id) {
      this.debounceTryChnageText({id: selectedImageAnnotation.id, [prop]: value})
    }
  }

  updateAnnotationTitle = (e) => {this.updateAnnotationPropsDebounced("title", e.currentTarget.value)}
  updateAnnotationLabel = (e) => {this.updateAnnotationPropsDebounced("label", e.currentTarget.value)}
  updateAnnotationTextColor = (e) => {this.updateAnnotationPropsDebounced("color", e.currentTarget.value)}
  updateAnnotationTitleSize = (e) => {
    const value = e.currentTarget.value || "inherit";
    const vChecked = Number.isInteger(value) ? (value < 10 ? 10 : value) : value;
    this.updateAnnotationPropsDebounced("titleSize", vChecked)
  }
  updateAnnotationStrokeWidth = (e) => {
    const value = e.currentTarget.value;
    const vChecked = value < 1 ? 1 : (value > 10 ? 10 : value);
    this.updateAnnotationPropsDebounced("strokeWidth", vChecked)
  }


  updateAnnotationProps = (prop, value) => {
    const {selectedImageAnnotation} = this.state;
    if(selectedImageAnnotation && selectedImageAnnotation.id) {
      this.updateAnnotation({id: selectedImageAnnotation.id, [prop]: value})
    }
  }
  updateConnectLine = () => {this.updateAnnotationProps("connect", "line")}
  updateConnectElbow = () => {this.updateAnnotationProps("connect","elbow")}
  updateConnectCurve = () => {this.updateAnnotationProps("connect","curve")}
  updatePointNone = () => {this.updateAnnotationProps("end","")}
  updatePointDot = () => {this.updateAnnotationProps("end","dot")}
  updatePointArrow = () => {this.updateAnnotationProps("end","arrow")}
  updateLineNone = () => {
    this.updateAnnotationProps("lineType","");
    this.updateAlignDynamic();
  }
  updateLineV = () => {
    this.updateAnnotationProps("lineType","vertical");
    this.updateAlignMiddle();
  }
  updateLineH = () => {
    this.updateAnnotationProps("lineType","horizontal");
    this.updateAlignMiddle();
  }
  updateLineNoneV = () => {
    this.updateAnnotationProps("lineType","verticalNone");
    this.updateAlignMiddle();
  }
  updateLineNoneH = () => {
    this.updateAnnotationProps("lineType","horizontalNone");
    this.updateAlignMiddle();
  }
  updateAlignLeft = () => {this.updateAnnotationProps("align","left")}
  updateAlignRight = () => {this.updateAnnotationProps("align","right")}
  updateAlignTop = () => {this.updateAnnotationProps("align","top")}
  updateAlignBottom = () => {this.updateAnnotationProps("align","bottom")}
  updateAlignMiddle = () => {this.updateAnnotationProps("align","middle")}
  updateAlignDynamic = () => {this.updateAnnotationProps("align","dynamic")}

  getImageDimension = () => {
    const width = this.imageRef && this.imageRef.current && this.imageRef.current.width || 700;
    const height = this.imageRef && this.imageRef.current && this.imageRef.current.height || 500;
    return {width, height}
  }

  imageSizeChange = e => {
    const value = e.currentTarget.value;
    const { selectedImage } = this.state
    if(selectedImage) {
      this.updateAnnotationDataForImg(selectedImage, value, "width");
    }
  }

  toggleEdit = () => {
    const {toggleEdit} = this.state;
    this.setState({toggleEdit: !toggleEdit});
  }
  toggleShow = () => {
    const {toggleShow} = this.state;
    this.setState({toggleShow: !toggleShow});
  }

  selectImageDialog = () => {
    this.props.sdk.dialogs.selectSingleEntry({
      locale: this.props.sdk.field.locale,
      contentTypes: ["imageOption"],
    }).then(selectedEntry => {
      console.log("selectedEntry", selectedEntry)
      if (selectedEntry && selectedEntry.sys && selectedEntry.sys.id) {
        this.updateAnnotationDataForProp("imageSrcId", selectedEntry.sys.id);
      }
    })
  }

  render() {
    // console.log("imageSource", this.props.sdk.entry.fields.imageSource)
    // console.log("name", this.props.sdk.entry.fields.name.getValue())
    // console.log("sdk", this.props.sdk)
    const Annotation = Annotations["AnnotationCalloutCircle"];

    const {imageFile, imageFileTablet, imageFileMobile} = this.state;
    const hasImg = imageFile || imageFileTablet || imageFileMobile;

    // const {annotationsData} = this.state;
    // console.log("render annotationsData", annotationsData)

    // if(this.state.imgError) {
    //   return  <div>
    //     <div>{this.state.imgError}</div>
    //   </div>
    // }

    if(!hasImg) {
      return <div className="linkingImage">
        {/*<div><Icon icon="Plus" /> <TextLink>Create new image option</TextLink> </div>*/}
        {/*<span className="css-1dwbrks" />*/}
        <div><Icon icon="Link" /><TextLink onClick={this.selectImageDialog}>Link existing entry</TextLink></div>
      </div>
    }

    const { selectedImage, selectedImageAnnotation, toggleEdit, toggleShow } = this.state
    const selectedImageFile = (selectedImage === 'desktop' && imageFile) || (selectedImage === 'tablet' && imageFileTablet) || (selectedImage === 'mobile' && imageFileMobile) || null

    const annotationsAdded = this.getAnnotationData(selectedImage, "annotations");
    const annotationSelected = (selectedImageAnnotation && selectedImageAnnotation.id && annotationsAdded[selectedImageAnnotation.id] && annotationsAdded[selectedImageAnnotation.id]) || {}

    const annotationItems = Object.keys(annotationsAdded);

    // console.log("render annotationsData", annotationsData)
    // console.log("render annotationSelected", annotationSelected)
    // console.log("render this.imageRef", this.imageRef)

    const { width:imageWidth, height: imageHeight } = this.getImageDimension();
    const defaultWidth = 700;
    const heightRatioed = imageHeight * defaultWidth / imageWidth;

    return (
      <div className="ext-img-annotate">

        <Dropdown
          isOpen={this.state.optionDropOpen}
          onClose={() => this.setState({optionDropOpen: false})}
          toggleElement={
            <Button size="small" buttonType="muted" indicateDropdown onClick={() => this.setState({optionDropOpen: true})} >Options</Button>
          }>
          <DropdownList >
            <DropdownListItem onClick={() => this.setState({optionDropOpen: false}, this.selectImageDialog)} >
              Change Image Option
            </DropdownListItem>
          </DropdownList>
          <DropdownList border="top">
            <DropdownListItem onClick={() => this.setState({optionDropOpen: false}, this.deleteAnnotationData)} >
              ! Remove
            </DropdownListItem>
          </DropdownList>

        </Dropdown>

        <hr />
        <br />
        {hasImg && <div>Select an image to configure annotations</div>}
        <br />
        <div className="imageList">
          {imageFile && <div className={`exist ${selectedImage === "desktop" && "selected"}`} onClick={this.selectDesktopImage}> <img src={imageFile} alt="img" /> Desktop<br/></div>}
          {!imageFile && <div> <img src="" alt="" /> Desktop <br/>(missing)</div>}
          {imageFileTablet && <div className={"exist " + (selectedImage === "tablet" && "selected")} onClick={this.selectTabletImage}> <img src={imageFileTablet} alt="img" /> Tablet</div>}
          {!imageFileTablet && <div> <img src="" alt="" /> Tablet <br/>(missing)</div>}
          {imageFileMobile && <div className={"exist " + (selectedImage === "mobile" && "selected")} onClick={this.selectMobileImage}> <img src={imageFileMobile} alt="img" /> Mobile</div>}
          {!imageFileMobile && <div> <img src="" alt="" /> Mobile <br/>(missing)</div>}
        </div>
        <hr />
        <div>Settings for <b>{selectedImage && selectedImage.toUpperCase()}</b> image</div>
        <ul>
          <li>Added Annotations Count: {annotationItems.length} <Button buttonType="positive" icon="Plus" onClick={this.addAnnotation}>Add</Button></li>
          <li>Display Size when in Page - Width: <Select className="widthInput" width="small" onChange={this.imageSizeChange}>
            <Option testId="auto" value="auto">Auto</Option>
            {widthOptions[(selectedImage === "mobile" && "small") || "large"].map(o => {
              return <Option key={o} testId={o.toString()} value={o + "px"} >{o + "px"}</Option>
            })}
          </Select></li>
          <li>
            <Button buttonType={toggleEdit ? "positive" : "negative"} icon="Cycle" onClick={this.toggleEdit}>Toggle Edit</Button>
            <Button buttonType={toggleShow ? "positive" : "negative"} icon="Cycle" onClick={this.toggleShow}>Toggle Show</Button>
          </li>


        </ul>

        <div className="annotationPanel">
          <div className='selectedImage'>
            <img ref={this.imageRef} src={selectedImageFile} alt="" />
            {toggleShow && <svg className="selectedImageAnnotation" viewBox={`0 0 ${defaultWidth} ${heightRatioed}`}>
              <svg className="selectedImageAnnotationInner">
                <path />
                {/*<Trail*/}
                {/*  native*/}
                {/*  keys={item => item}*/}
                {/*  items={annotationItems}>*/}
                {/*  {item => trailProps => {*/}
                {/*    console.log(trailProps)*/}
                {/*    const a = annotationsAdded[item];*/}
                {/*    const isSelected = selectedImageAnnotation && selectedImageAnnotation.target === selectedImage && selectedImageAnnotation.id === a.id;*/}

                {/*    return <Annotation*/}
                {/*      className={isSelected ? "selectedAnn" : ""}*/}
                {/*      key={`a_${a.id}`}*/}
                {/*      x={a.x}*/}
                {/*      y={a.y}*/}
                {/*      dx={a.dx}*/}
                {/*      dy={a.dy}*/}
                {/*      editMode={toggleEdit}*/}
                {/*      subject={{ radius: a.radius, radiusPadding: 0 }}*/}
                {/*      onDragEnd={props => {*/}
                {/*        // console.log("onDragEnd", props)*/}
                {/*        a.x = props.x;*/}
                {/*        a.y = props.y;*/}
                {/*        a.dx = props.dx;*/}
                {/*        a.dy = props.dy;*/}
                {/*        a.radius = props.radius;*/}
                {/*        this.setState({selectedImageAnnotation: {target: selectedImage, id: a.id}});*/}
                {/*        this.updateAnnotation(a);*/}
                {/*      }}*/}
                {/*      connector={{ type: a.connect, end: a.end }}*/}
                {/*      note={{title:a.title, label: a.label, lineType: a.lineType, align: a.align, titleSize: a.titleSize + "px", wrapSplitter: /[\n]+/ }}*/}
                {/*      color={a.color}*/}
                {/*      strokeWidth={a.strokeWidth}*/}
                {/*    />*/}
                {/*  }}*/}
                {/*</Trail>*/}

                {annotationItems.map((k, idx) => {
                  const a = annotationsAdded[k];
                  const isSelected = selectedImageAnnotation && selectedImageAnnotation.target === selectedImage && selectedImageAnnotation.id === a.id;

                  return <Annotation
                    className={isSelected ? "selectedAnn" : ""}
                    key={`a_${idx}_${a.id}`}
                    x={a.x}
                    y={a.y}
                    dx={a.dx}
                    dy={a.dy}
                    editMode={toggleEdit}
                    subject={{ radius: a.radius, radiusPadding: 0 }}
                    onDragEnd={props => {
                      // console.log("onDragEnd", props)
                      a.x = props.x;
                      a.y = props.y;
                      a.dx = props.dx;
                      a.dy = props.dy;
                      a.radius = props.radius;
                      this.setState({selectedImageAnnotation: {target: selectedImage, id: a.id}});
                      this.updateAnnotation(a);
                    }}
                    connector={{ type: a.connect, end: a.end }}
                    note={{title:a.title, label: a.label, lineType: a.lineType, align: a.align, titleSize: a.titleSize + "px", wrapSplitter: /[\n]+/ }}
                    color={a.color}
                    strokeWidth={a.strokeWidth}
                  />
                })}

              </svg>
            </svg>}
          </div>


        </div>
        {toggleEdit && selectedImageAnnotation && selectedImageAnnotation.id && <div>
          <hr />
          <div>Settings for <b>Annotation</b></div>
          <ul>
            <li>
              Annotation #{selectedImageAnnotation && selectedImageAnnotation.id} <Button buttonType="muted"  onClick={this.unSelectAnnotation}>Un-Select</Button>
              &nbsp; Annotation #{selectedImageAnnotation && selectedImageAnnotation.id} <Button buttonType="negative" icon="Delete" onClick={this.deleteAnnotation}>delete</Button>
            </li>

            <li>
              Text: <TextInput className="inline" width="medium" value={(annotationSelected && annotationSelected.title) || ""} onChange={this.updateAnnotationTitle} />
              &nbsp; Label: <TextInput className="inline" width="medium" value={(annotationSelected && annotationSelected.label) || ""} onChange={this.updateAnnotationLabel} />
              </li>
            <li>
              Size: <TextInput className="inline" width="small" type="number" min={10} value={(annotationSelected && annotationSelected.titleSize) || 10} onChange={this.updateAnnotationTitleSize} />
              &nbsp; Color: <TextInput className="inline" width="small" value={(annotationSelected && annotationSelected.color) || ""} onChange={this.updateAnnotationTextColor} />
              &nbsp; Thick: <TextInput className="inline" width="small" type="number" min={1} max={10} value={(annotationSelected && annotationSelected.strokeWidth) || 1} onChange={this.updateAnnotationStrokeWidth} />
            </li>
            <li>
              Connect Type &nbsp;
              <Button buttonType={annotationSelected.connect === "line" && "positive"} onClick={this.updateConnectLine}>Line</Button>
              <Button buttonType={annotationSelected.connect === "elbow" && "positive"} onClick={this.updateConnectElbow}>Elbow</Button>
              <Button buttonType={annotationSelected.connect === "curve" && "positive"} onClick={this.updateConnectCurve}>Curve</Button>
            </li>
            <li>
              Point Type &nbsp;
              <Button buttonType={annotationSelected.end === "" && "positive"} onClick={this.updatePointNone}>None</Button>
              <Button buttonType={annotationSelected.end === "dot" && "positive"} onClick={this.updatePointDot}>Dot</Button>
              <Button buttonType={annotationSelected.end === "arrow" && "positive"} onClick={this.updatePointArrow}>Arrow</Button>
            </li>
            <li>
              Text Type &nbsp;
              <Button buttonType={annotationSelected.lineType === "vertical" && "positive"} onClick={this.updateLineV}>Vertical</Button>
              <Button buttonType={annotationSelected.lineType === "horizontal" && "positive"} onClick={this.updateLineH}>Horizontal</Button>
              <Button buttonType={annotationSelected.lineType === "verticalNone" && "positive"} onClick={this.updateLineNoneV}>Vertical Hidden</Button>
              <Button buttonType={annotationSelected.lineType === "horizontalNone" && "positive"} onClick={this.updateLineNoneH}>Horizontal Hidden</Button>
            </li>
            <li>
              Align Type &nbsp;
              {["vertical", "verticalNone", ""].includes(annotationSelected.lineType) && <Button buttonType={annotationSelected.align === "top" && "positive"} onClick={this.updateAlignTop}>Top</Button>}
              {["vertical", "verticalNone", ""].includes(annotationSelected.lineType) && <Button buttonType={annotationSelected.align === "bottom" && "positive"} onClick={this.updateAlignBottom}>Bottom</Button>}
              {["horizontal", "horizontalNone", ""].includes(annotationSelected.lineType) && <Button buttonType={annotationSelected.align === "right" && "positive"} onClick={this.updateAlignRight}>Left</Button>}
              {["horizontal", "horizontalNone", ""].includes(annotationSelected.lineType) && <Button buttonType={annotationSelected.align === "left" && "positive"} onClick={this.updateAlignLeft}>Right</Button>}

              <Button buttonType={annotationSelected.align === "middle" && "positive"} onClick={this.updateAlignMiddle}>Middle</Button>
              {/*<Button buttonType={annotationSelected.align === "dynamic" && "positive"} onClick={this.updateAlignDynamic}>Dynamic</Button>*/}
            </li>


          </ul>

        </div>}
        <hr />

      </div>
    );
  }
}

init(sdk => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
