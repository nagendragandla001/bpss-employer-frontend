/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Row, Col, Form, Checkbox, Typography,
} from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import usePersistedState from 'utils/usePersistedState';
import { documentMapToName } from 'constants/enum-constants';
import { useQuery } from '@apollo/client';
import { documentQuery } from 'components/StaticPages/Common/CandidateDocuments/DocumentsUtils';

interface PropsModel {
  store?: any;
  documentData?:any;
}

const { Text } = Typography;

const DocumentsRequired = ({ store, documentData }: PropsModel): JSX.Element => {
  // const [visible, setVisible] = useState(!!(documentData && documentData.length > 0));
  const [document, setDocument] = usePersistedState('document_list', '');

  const license = [] as Array<{text: string; id: number}>;
  const governmentcard = [] as Array<{text: string; id: number}>;
  const othercard = [] as Array<{text: string; id: number}>;
  const liccomp = [] as Array<number>;
  const govcomp = [] as Array<number>;
  const othercomp = [] as Array<number>;

  const {
    data: newDocumentData,
  } = useQuery(documentQuery, {
    variables: {},
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  if (document) {
    for (let i = 0; i < 3; i += 1) {
      license.push(document.obj[i]);
      liccomp.push(document.obj[i].id);
    }
    for (let i = 3; i < 7; i += 1) {
      governmentcard.push(document.obj[i]);
      govcomp.push(document.obj[i].id);
    }
    for (let i = 7; i < document.obj.length; i += 1) {
      othercard.push(document.obj[i]);
      othercomp.push(document.obj[i].id);
    }
  }

  if (!document) {
    if (newDocumentData) {
      const obj = newDocumentData.documents.map((doc: { id: number; name: string }) => ({
        text: doc.name,
        id: doc.id,
      }));
      setDocument((prevState) => ({
        ...prevState,
        obj,
      }));
    }
  }

  return (
    <Row>
      <Col span={24} className="d-jp-requirements-section">
        <Row gutter={0}>
          <div
            className="text-small document-tooltip"
          >
            <Col md={{ span: 24 }} xs={{ span: 0 }}>
              <Text type="secondary">Multiple options can be selected*</Text>
            </Col>
          </div>
          {/* Licenses */}
          <Col
            span={24}
          >
            <Form.Item
              name="licensechecks"
              label="Documents Required"
              style={{
                padding: 0, margin: 0,
              }}
              className="m-all-0 p-all-0 display-flex"
            >
              <Checkbox.Group className="checkbox-btn flex-container">
                {license && license.length > 0
                          && license.map((d) => (
                            <Checkbox
                              value={d.id}
                              key={d.id}
                              onChange={(e): void => {
                                if (store) {
                                  store.updateLicDoc(documentMapToName(e.target.value));
                                  store.updateLicidDoc(e.target.value);
                                }
                              }}
                            >
                              {d.text}
                            </Checkbox>
                          ))}
              </Checkbox.Group>
            </Form.Item>
            <Form.Item
              name="governmentchecks"
              style={{
                margin: 0,
                padding: 0,
              }}
              className="flex-container"
            >
              <Checkbox.Group className="checkbox-btn flex-container">
                {governmentcard && governmentcard.length > 0
                        && governmentcard.map((d) => (
                          <Checkbox
                            value={d.id}
                            key={d.id}
                            onChange={(e): void => {
                              if (store) {
                                store.updateGovDoc(documentMapToName(e.target.value));
                                store.updateGovidDoc(e.target.value);
                              }
                            }}
                          >
                            {d.text}
                          </Checkbox>
                        ))}
              </Checkbox.Group>
            </Form.Item>
            <Form.Item
              name="otherschecks"
            >
              <Checkbox.Group className="checkbox-btn">
                {othercard && othercard.length > 0
                            && othercard.map((d) => (
                              <Checkbox
                                value={d.id}
                                key={d.id}
                                onChange={(e): void => {
                                  if (store) {
                                    store.updateOtherDoc(documentMapToName(e.target.value));
                                    store.updateOtheridDoc(e.target.value);
                                  }
                                }}
                              >
                                {d.text}
                              </Checkbox>
                            ))}
              </Checkbox.Group>
            </Form.Item>
          </Col>

        </Row>
      </Col>
    </Row>
  );
};

export default observer(DocumentsRequired);
