import React from "react"
import { Card, CardHeader, CardTitle, CardText } from "material-ui/Card"
import Toggle from "material-ui/Toggle"
import TextField from "material-ui/TextField"
import FloatingActionButton from "material-ui/FloatingActionButton"

import Annotations from "react-annotation/lib/index"

const tColor = "red"

const types = {
  AnnotationLabel: {
    typeSettings: {
      className: "show-bg",
      note: {
        align: "middle",
        orientation: "topBottom",
        bgPadding: 20,
        padding: 15,
        titleColor: "#59039c"
      },
      connector: { type: "line" }
    },
    summary: "A centered label annotation",
    img: "a-label.png"
  },
  AnnotationCallout: {
    typeSettings: {
      className: "show-bg",
      note: {
        lineType: "horizontal",
        bgPadding: { top: 15, left: 10, right: 10, bottom: 10 },
        padding: 15,
        titleColor: "#59039c"
      },
      connector: { type: "line" }
    },
    summary: "Adds a line along the note",
    img: "a-callout.png"
  },
  AnnotationCalloutElbow: {
    typeSettings: {
      note: { lineType: "horizontal" },
      connector: { type: "elbow" }
    },
    summary: "Keeps connector at 45 and 90 degree angles",
    img: "a-elbow.png"
  },
  AnnotationCalloutCircle: {
    typeSettings: {
      note: { lineType: "horizontal" },
      connector: { type: "elbow" }
    },
    summary: "Subject options: radius, innerRadius, outerRadius, ",
    summaryCont: "radiusPadding",
    subject: {
      radius: 50,
      radiusPadding: 0
    },
    img: "a-circle.png"
  },
  AnnotationCalloutRect: {
    typeSettings: {
      note: { lineType: "horizontal" },
      connector: { type: "elbow" }
    },
    summary: "Subject options: width, height",
    subject: {
      width: -50,
      height: 100
    },
    img: "a-rect.png"
  },
  AnnotationCalloutCurve: {
    typeSettings: {
      note: { lineType: "horizontal" },
      connector: { type: "curve" }
    },
    summary: "Connector options: curve, ",
    summaryCont: "points(array of [x,y]s or number)",
    img: "a-curve.png"
  },
  AnnotationXYThreshold: {
    typeSettings: {
      note: { lineType: "horizontal" },
      connector: { type: "elbow" }
    },
    summary: "Subject options: x1, x2 or y1, y2",
    subject: {
      x1: 0,
      x2: 1000
    },
    img: "a-threshold.png"
  },
  AnnotationBadge: {
    typeSettings: {
      note: { lineType: "horizontal" },
      connector: { type: "elbow" }
    },
    summary: "Subject options: radius, text, x:left or right, y:top or bottom",
    subject: {
      radius: 14,
      text: "A"
    },
    img: "a-badge.png"
  },
  AnnotationBracket: {
    typeSettings: {
      note: {},
      connector: { type: "elbow" }
    },
    summary: "Subject options: height or width, depth, type (square or curly)",
    subject: {
      height: 100,
      type: "square"
    },
    img: "a-bracket.png"
  }
}

const typesOrder = [
  "AnnotationLabel",
  "AnnotationCallout",
  "AnnotationCalloutElbow",
  "AnnotationCalloutCurve",
  "AnnotationCalloutCircle",
  "AnnotationCalloutRect",
  "AnnotationXYThreshold",
  "AnnotationBracket",
  "AnnotationBadge"
]

export default class Types extends React.Component {
  state = {
    name: "AnnotationCalloutCircle",
    description: types.AnnotationLabel.summary,
    editMode: true,
    connector: {},
    note: {},
    subject: {}
  }
  updateType(t) {
    this.setState({
      name: t,
      description: types[t].summary,
      connector: {},
      note: {},
      subject: {}
    })
  }

  updateNote(property, value) {
    const settings = Object.assign({}, this.state.note)
    settings[property] = value
    this.setState({
      note: settings
    })
  }

  updateConnector(property, value) {
    const settings = Object.assign({}, this.state.connector)
    settings[property] = value
    this.setState({
      connector: settings
    })
  }

  updateSubject(property, value) {
    const settings = Object.assign({}, this.state.subject)
    settings[property] = value
    this.setState({
      subject: settings
    })
  }

  render() {
    const name = this.state.name
    const imgs = typesOrder.map(i => {
      const t = types[i]
      return (
        <img
          key={i}
          alt={t.img}
          className={`icon ${name === i ? "selected" : ""}`}
          onClick={this.updateType.bind(this, i)}
          src={`img/${t.img}`}
        />
      )
    })

    const Annotation = Annotations[name]
    const t = types[name]
    const subject = this.state.subject
    const connector = this.state.connector

    const note = Object.assign(
      {},
      {
        title: "Annotations :)",
        label: "Longer text to show text wrapping"
      },
      t.typeSettings.note,
      this.state.note
    )

    const subjectJoined = Object.assign({}, t.subject, subject)
    const connectorJoined = Object.assign(
      {},
      t.typeSettings.connector,
      connector
    )

    const noteJoined = Object.assign({}, t.typeSettings.note, this.state.note)

    let orientation

    if (!noteJoined.lineType) {
      orientation = (
        <div>
          <p>Orientation</p>
          <img
            className={`tiny-icon ${
              note.orientation === "topBottom" ? "selected" : ""
            }`}
            onClick={this.updateNote.bind(this, "orientation", "topBottom")}
            src="img/topBottom.png"
          />
          <img
            className={`tiny-icon ${
              note.orientation === "leftRight" ? "selected" : ""
            }`}
            onClick={this.updateNote.bind(this, "orientation", "leftRight")}
            src="img/leftRight.png"
          />
        </div>
      )
    }

    let alignFirst = "left"
    let alignSecond = "right"

    if (
      noteJoined.lineType === "vertical" ||
      noteJoined.orientation === "leftRight"
    ) {
      alignFirst = "top"
      alignSecond = "bottom"
    }

    let bracketType

    if (this.state.name === "AnnotationBracket") {
      bracketType = (
        <div style={{ position: "absolute", top: 20, right: 30 }}>
          <FloatingActionButton
            onClick={this.updateSubject.bind(this, "type", "square")}
            mini={true}
            secondary={this.state.subject.type === "curly" ? true : false}
            iconStyle={{
              color: "white",
              lineHeight: ".8em",
              fontSize: "1.4em"
            }}
          >
            {"]"}
          </FloatingActionButton>
          <FloatingActionButton
            onClick={this.updateSubject.bind(this, "type", "curly")}
            mini={true}
            secondary={this.state.subject.type !== "curly" ? true : false}
            iconStyle={{
              color: "white",
              lineHeight: ".8em",
              fontSize: "1.4em"
            }}
          >
            {"}"}
          </FloatingActionButton>
        </div>
      )
    }

    return (
      <div>

        <h3>Use {name}</h3>
        <div style={{ position: "relative" }}>
          {bracketType}
          <svg className="types viz">
            <g transform="translate(30,60)">
              <text className="title">{name}</text>
              <text className="summary" y={30}>
                {this.state.description}
              </text>
            </g>
            <Annotation
              x={150}
              y={170}
              dy={name === "AnnotationBracket" ? undefined : 117}
              dx={name === "AnnotationBracket" ? undefined : 162}
              editMode={this.state.editMode}
              subject={subjectJoined}
              connector={connector}
              className={t.typeSettings.className}
              color={tColor}
              note={note}
            />
            <text x="30" y="415" className="summary">
              Code below is ready to use with these setttings
            </text>
          </svg>
        </div>

      </div>
    )
  }
}
